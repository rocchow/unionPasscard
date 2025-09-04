import { createSupabaseBrowserClient } from './supabase'
import type { AuthUser } from './auth'

export interface UserPermissions {
  user_id: string
  primary_role: string
  primary_company_id: string | null
  primary_venue_id: string | null
  company_associations: Array<{
    company_id: string
    role: 'admin' | 'manager'
    company_name: string
  }>
  venue_associations: Array<{
    venue_id: string
    role: 'staff' | 'manager'
    venue_name: string
    company_id: string
    company_name: string
  }>
}

/**
 * Get comprehensive user permissions including all company and venue associations
 */
export async function getUserPermissions(userId: string): Promise<UserPermissions | null> {
  const supabase = createSupabaseBrowserClient()
  
  const { data, error } = await supabase
    .from('user_permissions')
    .select('*')
    .eq('user_id', userId)
    .single()
    
  if (error) {
    console.error('Error fetching user permissions:', error)
    return null
  }
  
  return data as UserPermissions
}

/**
 * Check if user can access a specific company
 */
export async function canAccessCompany(user: AuthUser, companyId: string): Promise<boolean> {
  // Super admin can access everything
  if (user.role === 'super_admin') {
    return true
  }
  
  const supabase = createSupabaseBrowserClient()
  
  // Use the database function for access control
  const { data, error } = await supabase
    .rpc('user_can_access_company', {
      user_id: user.id,
      company_id: companyId
    })
    
  if (error) {
    console.error('Error checking company access:', error)
    return false
  }
  
  return data === true
}

/**
 * Check if user can access a specific venue
 */
export async function canAccessVenue(user: AuthUser, venueId: string): Promise<boolean> {
  // Super admin can access everything
  if (user.role === 'super_admin') {
    return true
  }
  
  const supabase = createSupabaseBrowserClient()
  
  // Use the database function for access control
  const { data, error } = await supabase
    .rpc('user_can_access_venue', {
      user_id: user.id,
      venue_id: venueId
    })
    
  if (error) {
    console.error('Error checking venue access:', error)
    return false
  }
  
  return data === true
}

/**
 * Get all companies a user has access to
 */
export async function getUserCompanies(userId: string): Promise<Array<{
  id: string
  name: string
  role: string
  access_type: 'primary' | 'association'
}>> {
  const permissions = await getUserPermissions(userId)
  if (!permissions) return []
  
  const companies: Array<{
    id: string
    name: string
    role: string
    access_type: 'primary' | 'association'
  }> = []
  
  // Add primary company if exists
  if (permissions.primary_company_id) {
    const supabase = createSupabaseBrowserClient()
    const { data: company } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', permissions.primary_company_id)
      .single()
      
    if (company) {
      companies.push({
        id: company.id,
        name: company.name,
        role: permissions.primary_role,
        access_type: 'primary'
      })
    }
  }
  
  // Add associated companies
  permissions.company_associations.forEach(assoc => {
    companies.push({
      id: assoc.company_id,
      name: assoc.company_name,
      role: assoc.role,
      access_type: 'association'
    })
  })
  
  return companies
}

/**
 * Get all venues a user has access to
 */
export async function getUserVenues(userId: string): Promise<Array<{
  id: string
  name: string
  company_id: string
  company_name: string
  role: string
  access_type: 'primary' | 'association' | 'company'
}>> {
  const permissions = await getUserPermissions(userId)
  if (!permissions) return []
  
  const venues: Array<{
    id: string
    name: string
    company_id: string
    company_name: string
    role: string
    access_type: 'primary' | 'association' | 'company'
  }> = []
  
  // Add primary venue if exists
  if (permissions.primary_venue_id) {
    const supabase = createSupabaseBrowserClient()
    const { data: venue } = await supabase
      .from('venues')
      .select(`
        id, 
        name, 
        company_id,
        companies!inner(name)
      `)
      .eq('id', permissions.primary_venue_id)
      .single()
      
    if (venue) {
      venues.push({
        id: venue.id,
        name: venue.name,
        company_id: venue.company_id,
        company_name: venue.companies.name,
        role: permissions.primary_role,
        access_type: 'primary'
      })
    }
  }
  
  // Add directly associated venues
  permissions.venue_associations.forEach(assoc => {
    venues.push({
      id: assoc.venue_id,
      name: assoc.venue_name,
      company_id: assoc.company_id,
      company_name: assoc.company_name,
      role: assoc.role,
      access_type: 'association'
    })
  })
  
  // Add venues from company associations (company admins can access all company venues)
  if (permissions.company_associations.length > 0) {
    const supabase = createSupabaseBrowserClient()
    const companyIds = permissions.company_associations.map(a => a.company_id)
    
    const { data: companyVenues } = await supabase
      .from('venues')
      .select(`
        id,
        name,
        company_id,
        companies!inner(name)
      `)
      .in('company_id', companyIds)
      
    if (companyVenues) {
      companyVenues.forEach((venue: any) => {
        // Don't duplicate venues already added
        if (!venues.find(v => v.id === venue.id)) {
          venues.push({
            id: venue.id,
            name: venue.name,
            company_id: venue.company_id,
            company_name: venue.companies.name,
            role: 'company_admin',
            access_type: 'company'
          })
        }
      })
    }
  }
  
  return venues
}

/**
 * Assign user to a company
 */
export async function assignUserToCompany(
  userId: string, 
  companyId: string, 
  role: 'admin' | 'manager'
): Promise<boolean> {
  const supabase = createSupabaseBrowserClient()
  
  const { error } = await supabase
    .from('user_companies')
    .upsert({
      user_id: userId,
      company_id: companyId,
      role: role
    })
    
  if (error) {
    console.error('Error assigning user to company:', error)
    return false
  }
  
  return true
}

/**
 * Assign user to a venue
 */
export async function assignUserToVenue(
  userId: string, 
  venueId: string, 
  role: 'staff' | 'manager'
): Promise<boolean> {
  const supabase = createSupabaseBrowserClient()
  
  const { error } = await supabase
    .from('user_venues')
    .upsert({
      user_id: userId,
      venue_id: venueId,
      role: role
    })
    
  if (error) {
    console.error('Error assigning user to venue:', error)
    return false
  }
  
  return true
}

/**
 * Remove user from company
 */
export async function removeUserFromCompany(userId: string, companyId: string): Promise<boolean> {
  const supabase = createSupabaseBrowserClient()
  
  const { error } = await supabase
    .from('user_companies')
    .delete()
    .eq('user_id', userId)
    .eq('company_id', companyId)
    
  if (error) {
    console.error('Error removing user from company:', error)
    return false
  }
  
  return true
}

/**
 * Remove user from venue
 */
export async function removeUserFromVenue(userId: string, venueId: string): Promise<boolean> {
  const supabase = createSupabaseBrowserClient()
  
  const { error } = await supabase
    .from('user_venues')
    .delete()
    .eq('user_id', userId)
    .eq('venue_id', venueId)
    
  if (error) {
    console.error('Error removing user from venue:', error)
    return false
  }
  
  return true
}
