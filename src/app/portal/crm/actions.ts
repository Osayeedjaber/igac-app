'use server';

import { getServiceSupabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/session';

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('crm_session');
  
  if (!token) {
    throw new Error('Unauthorized access');
  }

  // Support both the legacy 'authenticated' string and the newer JWT tokens
  if (token.value === 'authenticated') {
    return;
  }

  const payload = await verifySessionToken(token.value);
  if (!payload || (payload.role !== 'admin' && payload.role !== 'secretariat')) {
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

export async function sendSecretariatInvitationAction(formData: FormData) {
  await checkAuth();
  
  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;

  if (!fullName || !email) {
    throw new Error('Name and Email are required');
  }

  // Use the internal API we just created to send the invitation
  // We call it via a relative URL if possible or just trigger the logic
  // Since we are in a Server Action, we can reuse the logic or fetch it.
  // To keep it simple and consistent, we'll fetch the local API.
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/admin/invite-secretariat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      full_name: fullName,
      committee: 'Logistics',
      role: 'Secretariat Logistics'
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to send invitation');
  }

  return { success: true };
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

  // 2. Get pending invitations
  const { data: invites, error: inviteError } = await supabase
    .from('secretariat_invites')
    .select('*')
    .eq('used', false)
    .order('created_at', { ascending: false });

  // 3. Count total check-ins per secretariat
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

  // Combine profiles and pending invites
  const activeMembers = (profiles || []).map((p: any) => ({
    id: p.id,
    full_name: p.full_name,
    username: p.username,
    email: p.email,
    role: p.role,
    scan_count: counts[p.id] || 0,
    status: 'ACTIVE'
  }));

  const pendingMembers = (invites || []).map((i: any) => ({
    id: i.id,
    full_name: i.full_name,
    role: i.role,
    email: i.email,
    scan_count: 0,
    status: 'PENDING',
    isInvite: true
  }));

  return [...pendingMembers, ...activeMembers];
}

export async function updateSecretariatAccountAction(id: string, formData: FormData) {
  await checkAuth();
  const supabase = getServiceSupabase();

  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;

  if (!fullName || !email) {
    throw new Error('Full Name and Email are required');
  }

  // 1. Update Auth user
  const authUpdates: any = { email };
  authUpdates.user_metadata = { full_name: fullName, username: username };
  if (password) {
    authUpdates.password = password;
  }

  const { error: authError } = await supabase.auth.admin.updateUserById(id, authUpdates);
  if (authError) throw new Error('Auth Update Error: ' + authError.message);

  // 2. Update Profile
  const { error: profileError } = await supabase
    .from('secretariat_profiles')
    .update({ 
      full_name: fullName,
      username: username
    })
    .eq('id', id);

  if (profileError) throw new Error('Profile Update Error: ' + profileError.message);

  return { success: true };
}

export async function deleteSecretariatAccountAction(id: string) {
  await checkAuth();
  const supabase = getServiceSupabase();

  // Try to find if it's a pending invite first
  const { data: invite } = await supabase
    .from('secretariat_invites')
    .select('id')
    .eq('id', id)
    .single();

  if (invite) {
    const { error } = await supabase
      .from('secretariat_invites')
      .delete()
      .eq('id', id);
    if (error) throw new Error('Invite Revoke Error: ' + error.message);
    return { success: true };
  }

  // Otherwise, delete the profile and the auth user
  const { error: profileError } = await supabase
    .from('secretariat_profiles')
    .delete()
    .eq('id', id);

  if (profileError) throw new Error('Profile Delete Error: ' + profileError.message);

  const { error: authError } = await supabase.auth.admin.deleteUser(id);
  if (authError) throw new Error('Auth Delete Error: ' + authError.message);

  return { success: true };
}

export async function fetchSystemSettingsAction() {
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
    .select('id, delegate_id, checkpoint, created_at, scan_type')
    .eq('day', day)
    .order('created_at', { ascending: false });
    
  const registrationSet = new Set();
  const committeeSet = new Set();
  const hourlyVelocity: Record<string, number> = {};
  const exitSet = new Set();
  
  (checkins || []).forEach((c: any) => {
    // Basic Entry Sets
    if (c.scan_type === 'EXIT') {
       exitSet.add(c.delegate_id);
    } else {
       if (c.checkpoint === 'registration') registrationSet.add(c.delegate_id);
       if (c.checkpoint === 'committee') committeeSet.add(c.delegate_id);
    }

    // Velocity Calculation (Hourly)
    const hour = new Date(c.created_at).getHours();
    const label = `${hour}:00`;
    hourlyVelocity[label] = (hourlyVelocity[label] || 0) + 1;
  });

  // Sort velocity keys to ensure chronological order
  const velocityData = Object.entries(hourlyVelocity)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => {
       const hA = parseInt(a.time);
       const hB = parseInt(b.time);
       return hA - hB;
    });

  const { data: delegates } = await supabase.from('delegates').select('id, full_name, committee, country');
  const committeeStats: Record<string, { total: number, reg_present: number, comm_present: number, exits: number }> = {};
  
  const delegateMap: Record<string, any> = {};
  
  (delegates || []).forEach((d: any) => {
    delegateMap[d.id] = d;
    const comm = d.committee || 'Unallocated';
    if (!committeeStats[comm]) committeeStats[comm] = { total: 0, reg_present: 0, comm_present: 0, exits: 0 };
    committeeStats[comm].total++;
    
    if (registrationSet.has(d.id)) committeeStats[comm].reg_present++;
    if (committeeSet.has(d.id)) committeeStats[comm].comm_present++;
    if (exitSet.has(d.id)) committeeStats[comm].exits++;
  });

  const recentScans = (checkins || []).slice(0, 15).map((c: any) => {
    const d = delegateMap[c.delegate_id] || {};
    return {
      id: c.id || Math.random().toString(),
      time: c.created_at || new Date().toISOString(),
      checkpoint: c.checkpoint || 'Unknown',
      scan_type: c.scan_type || 'ENTRY',
      full_name: d.full_name || 'Unknown Delegate',
      committee: d.committee || 'Unallocated',
      country: d.country || 'Unallocated'
    };
  });

  return {
    totalDelegates: totalDelegates || 0,
    registeredCount: registrationSet.size,
    committeeCount: committeeSet.size,
    exitCount: exitSet.size,
    committeeStats,
    recentScans,
    velocityData
  };
}
