'use server';

import { getServiceSupabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('crm_session');
  if (!token || token.value !== 'authenticated') {
    throw new Error('Unauthorized access');
  }
}

export async function fetchDelegatesAction() {
  await checkAuth();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('delegates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch error:', error);
    throw new Error(error.message);
  }
  return data;
}

export async function addDelegateAction(delegateData: any) {
  await checkAuth();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('delegates')
    .insert([delegateData])
    .select()
    .single();

  if (error) {
    console.error('Insert error:', error);
    throw new Error(error.message);
  }
  return data;
}

export async function addDelegatesBatchAction(delegatesData: any[]) {
  await checkAuth();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('delegates')
    .insert(delegatesData);

  if (error) {
    console.error('Batch insert error:', error);
    throw new Error(error.message);
  }
  return data;
}

export async function editDelegateAction(id: string, updates: any) {
  await checkAuth();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('delegates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update error:', error);
    throw new Error(error.message);
  }
  return data;
}

export async function fetchDelegateCheckinsAction(delegateId: string) {
  await checkAuth();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('delegate_checkins')
    .select(`
      *,
      scanned_by:scanned_by_id ( full_name )
    `)
    .eq('delegate_id', delegateId)
    .order('scanned_at', { ascending: false });

  if (error) {
    console.error('Fetch checkins error:', error);
    throw new Error(error.message);
  }
  return data;
}

export async function editDelegateCheckinAction(id: string, updates: any) {
  await checkAuth();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('delegate_checkins')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update checkin error:', error);
    throw new Error(error.message);
  }
  return data;
}

export async function deleteDelegateCheckinAction(id: string) {
  await checkAuth();
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from('delegate_checkins')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete checkin error:', error);
    throw new Error(error.message);
  }
  return true;
}

export async function fetchScanLogsAction() {
  await checkAuth();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('delegate_checkins')
    .select(`
      id, scanned_at, checkpoint, day,
      delegate:delegate_id ( full_name, committee, country ),
      scanned_by:scanned_by_id ( full_name )
    `)
    .order('scanned_at', { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return data;
}

export async function fetchCommitteesProgressAction() {
  await checkAuth();
  const supabase = getServiceSupabase();
  
  // Get all delegates to group by committee
  const { data: delegates, error: delError } = await supabase
    .from('delegates')
    .select('*');

  if (delError) throw new Error(delError.message);

  // Get all unique checkins for "day 1 registration" (to see who entered today).
  // Ideally, just get all checkins and process in memory for flexibility.
  const { data: checkins, error: chkError } = await supabase
    .from('delegate_checkins')
    .select('*, scanned_by:scanned_by_id(full_name)');

  if (chkError) throw new Error(chkError.message);

  return { delegates, checkins };
}

export async function createSecretariatAccountAction(formData: FormData) {
  await checkAuth();
  const supabase = getServiceSupabase();

  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!fullName || !email || !password) {
    throw new Error('All fields are required');
  }

  // 1. Create Auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    throw new Error('Auth Error: ' + authError.message);
  }

  if (!authData.user) {
    throw new Error('Failed to create user in Auth');
  }

  // 2. Create the associated profile
  const { error: profileError } = await supabase
    .from('secretariat_profiles')
    .insert({
      id: authData.user.id,
      full_name: fullName,
      role: 'secretariat'
    });

  if (profileError) {
    // If profile fails, best effort cleanup
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error('Profile Error: ' + profileError.message);
  }

  return { success: true };
}

export async function fetchSecretariatsAction() {
  await checkAuth();
  const supabase = getServiceSupabase();

  // 1. Get all secretariat profiles
  const { data: profiles, error: profError } = await supabase
    .from('secretariat_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profError) throw new Error(profError.message);

  // 2. Count total check-ins per secretariat
  const { data: checkins, error: chkError } = await supabase
    .from('delegate_checkins')
    .select('scanned_by_id');

  if (chkError) throw new Error(chkError.message);

  const counts: Record<string, number> = {};
  for (const c of checkins) {
    if (c.scanned_by_id) {
      counts[c.scanned_by_id] = (counts[c.scanned_by_id] || 0) + 1;
    }
  }

  return (profiles || []).map((p: any) => ({
    id: p.id,
    full_name: p.full_name,
    role: p.role,
    created_at: p.created_at,
    scan_count: counts[p.id] || 0
  }));
}

export async function updateSecretariatAccountAction(id: string, formData: FormData) {
  await checkAuth();
  const supabase = getServiceSupabase();

  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!fullName || !email) {
    throw new Error('Full Name and Email are required');
  }

  // 1. Update Auth user
  const authUpdates: any = { email };
  if (password) {
    authUpdates.password = password;
  }

  const { error: authError } = await supabase.auth.admin.updateUserById(id, authUpdates);
  if (authError) throw new Error('Auth Update Error: ' + authError.message);

  // 2. Update Profile
  const { error: profileError } = await supabase
    .from('secretariat_profiles')
    .update({ full_name: fullName })
    .eq('id', id);

  if (profileError) throw new Error('Profile Update Error: ' + profileError.message);

  return { success: true };
}

export async function deleteSecretariatAccountAction(id: string) {
  await checkAuth();
  const supabase = getServiceSupabase();

  // 1. Delete from custom profiles table
  const { error: profileError } = await supabase
    .from('secretariat_profiles')
    .delete()
    .eq('id', id);

  if (profileError) throw new Error('Profile Delete Error: ' + profileError.message);

  // 2. Delete from Auth (this wipes identities too)
  const { error: authError } = await supabase.auth.admin.deleteUser(id);
  if (authError) throw new Error('Auth Delete Error: ' + authError.message);

  return { success: true };
}

export async function fetchSystemSettingsAction() {
  await checkAuth();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from('system_settings').select('*').eq('id', 1).single();
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data || { active_day: 1, active_checkpoint: 'registration' };
}

export async function updateSystemSettingsAction(updates: any) {
  await checkAuth();
  const supabase = getServiceSupabase();
  const { error } = await supabase.from('system_settings')
    .upsert({ id: 1, ...updates });
  if (error) throw new Error(error.message);
  return true;
}

export async function fetchLiveAnalyticsAction(day: number) {
  await checkAuth();
  const supabase = getServiceSupabase();
  
  const { count: totalDelegates } = await supabase.from('delegates').select('*', { count: 'exact', head: true });
  
  const { data: checkins } = await supabase.from('delegate_checkins')
    .select('id, delegate_id, checkpoint, created_at')
    .eq('day', day)
    .order('created_at', { ascending: false });
    
  const registrationSet = new Set();
  const committeeSet = new Set();
  
  (checkins || []).forEach((c: any) => {
    if (c.checkpoint === 'registration') registrationSet.add(c.delegate_id);
    if (c.checkpoint === 'committee') committeeSet.add(c.delegate_id);
  });

  const { data: delegates } = await supabase.from('delegates').select('id, full_name, committee, country');
  const committeeStats: Record<string, { total: number, reg_present: number, comm_present: number }> = {};
  
  const delegateMap: Record<string, any> = {};
  
  (delegates || []).forEach((d: any) => {
    delegateMap[d.id] = d;
    const comm = d.committee || 'Unallocated';
    if (!committeeStats[comm]) committeeStats[comm] = { total: 0, reg_present: 0, comm_present: 0 };
    committeeStats[comm].total++;
    
    if (registrationSet.has(d.id)) committeeStats[comm].reg_present++;
    if (committeeSet.has(d.id)) committeeStats[comm].comm_present++;
  });

  const recentScans = (checkins || []).slice(0, 15).map((c: any) => {
    const d = delegateMap[c.delegate_id] || {};
    return {
      id: c.id || Math.random().toString(),
      time: c.created_at || new Date().toISOString(),
      checkpoint: c.checkpoint || 'Unknown',
      full_name: d.full_name || 'Unknown Delegate',
      committee: d.committee || 'Unallocated',
      country: d.country || 'Unallocated'
    };
  });

  return {
    totalDelegates: totalDelegates || 0,
    registeredCount: registrationSet.size,
    committeeCount: committeeSet.size,
    committeeStats,
    recentScans
  };
}
