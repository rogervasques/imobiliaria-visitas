import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { Usuario, Convite } from '@/types';
import { supabase } from './supabase';
import { generateInstanceName } from './utils';

export { generateInstanceName };

export const SESSION_COOKIE_NAME = 'easymob_session';

// Chave secreta para assinatura dos tokens de sessão
const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'easymob_jwt_super_secret_key_2026_production'
);

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'corretor';
  avatar?: string;
  imobiliaria: string;
  instance_name: string;
}

// Senha do Administrador Inicial: @Asenha12
export const INITIAL_ADMIN_EMAIL = 'rogervasques@gmail.com';
export const INITIAL_ADMIN_PASSWORD_RAW = '@Asenha12';
export const INITIAL_ADMIN_PASSWORD_HASH = bcrypt.hashSync('@Asenha12', 10);

// Usuários iniciais do sistema
export const INITIAL_USERS: Usuario[] = [
  {
    id: 'user-admin-master',
    nome: 'Roger Vasques Berchembrock',
    email: 'rogervasques@gmail.com',
    telefone: '11999999999',
    senha_hash: INITIAL_ADMIN_PASSWORD_HASH,
    role: 'admin',
    imobiliaria: 'Administração',
    instance_name: 'easymob_user_admin_master',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'user-corretor-1',
    nome: 'Carlos Corretor',
    email: 'carlos@easymob.com.br',
    telefone: '11988887777',
    senha_hash: bcrypt.hashSync('@Asenha12', 10),
    role: 'corretor',
    imobiliaria: 'EasyMob Imóveis',
    instance_name: 'easymob_user_corretor_1',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
];

// Banco de dados em memória para persistência local / fallback
let globalUsersStore: Usuario[] = [...INITIAL_USERS];
const globalInvitesStore: Convite[] = [];

/**
 * Realiza o UPSERT (inserir ou atualizar) do Administrador inicial no banco de dados e na memória
 */
export async function upsertAdminSeedUser(): Promise<{ success: boolean; user?: Usuario; error?: string }> {
  try {
    const adminEmail = INITIAL_ADMIN_EMAIL.toLowerCase().trim();
    const adminNome = 'Roger Vasques Berchembrock';
    const adminRole = 'admin';
    const adminImobiliaria = 'Administração';
    const senhaHash = await hashPassword('@Asenha12');

    // 1. Tenta UPSERT no Supabase
    try {
      const instanceName = 'easymob_user_admin_master';
      const { data, error } = await supabase
        .from('users')
        .upsert(
          {
            email: adminEmail,
            nome: adminNome,
            role: adminRole,
            imobiliaria: adminImobiliaria,
            instance_name: instanceName,
            senha_hash: senhaHash,
            telefone: '11999999999',
          },
          { onConflict: 'email' }
        )
        .select()
        .single();

      if (!error && data) {
        const adminUser: Usuario = {
          id: data.id,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          senha_hash: senhaHash,
          role: 'admin',
          imobiliaria: data.imobiliaria,
          instance_name: data.instance_name || instanceName,
          created_at: data.created_at || new Date().toISOString(),
        };

        const idx = globalUsersStore.findIndex((u) => u.email.toLowerCase() === adminEmail);
        if (idx >= 0) {
          globalUsersStore[idx] = adminUser;
        } else {
          globalUsersStore.unshift(adminUser);
        }

        console.log(`[Auth Seed] Administrador "${adminEmail}" sincronizado com sucesso no Supabase com instance_name "${adminUser.instance_name}".`);
        return { success: true, user: adminUser };
      }
    } catch (dbErr) {
      console.warn('[Auth Seed] Aviso ao sincronizar com Supabase:', dbErr);
    }

    // 2. Atualiza no store local (fallback em memória)
    const idx = globalUsersStore.findIndex((u) => u.email.toLowerCase() === adminEmail);
    const localAdmin: Usuario = {
      id: idx >= 0 ? globalUsersStore[idx].id : 'user-admin-master',
      nome: adminNome,
      email: adminEmail,
      telefone: '11999999999',
      senha_hash: senhaHash,
      role: 'admin',
      imobiliaria: adminImobiliaria,
      instance_name: 'easymob_user_admin_master',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
    };

    if (idx >= 0) {
      globalUsersStore[idx] = localAdmin;
    } else {
      globalUsersStore.unshift(localAdmin);
    }

    console.log(`[Auth Seed] Administrador "${adminEmail}" sincronizado no store local com instance_name "${localAdmin.instance_name}".`);
    return { success: true, user: localAdmin };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao realizar seed do administrador';
    console.error('[Auth Seed] Erro ao forçar seed do admin:', err);
    return { success: false, error: message };
  }
}

/**
 * Inicializa e sincroniza a tabela de usuários com o banco de dados
 */
export async function ensureInitialAdminUser() {
  await upsertAdminSeedUser();
}

/**
 * Busca usuário completo com senha_hash para autenticação segura
 */
export async function findUserByEmailForAuth(email: string): Promise<Usuario | null> {
  const normalized = email.toLowerCase().trim();

  // 1. Tenta buscar no Supabase
  try {
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('id, nome, email, telefone, senha_hash, role, imobiliaria, instance_name, avatar_url, created_at')
      .eq('email', normalized)
      .single();

    if (!error && dbUser && dbUser.senha_hash) {
      return {
        id: dbUser.id,
        nome: dbUser.nome || 'Usuário',
        email: dbUser.email,
        telefone: dbUser.telefone,
        senha_hash: dbUser.senha_hash,
        role: (dbUser.role as 'admin' | 'corretor') || 'corretor',
        imobiliaria: dbUser.imobiliaria || 'EasyMob Imóveis',
        instance_name: dbUser.instance_name || generateInstanceName(dbUser.id),
        avatar_url: dbUser.avatar_url,
        created_at: dbUser.created_at,
      };
    }
  } catch (err) {
    console.warn('[Auth] Erro ao buscar usuário no Supabase:', err);
  }

  // 2. Busca no globalUsersStore local
  const localFound = globalUsersStore.find((u) => u.email.toLowerCase().trim() === normalized);
  if (localFound) {
    return {
      ...localFound,
      instance_name: localFound.instance_name || generateInstanceName(localFound.id),
    };
  }

  // 3. Fallback garantido para o Administrador Inicial
  if (normalized === INITIAL_ADMIN_EMAIL.toLowerCase().trim()) {
    const adminHash = await hashPassword(INITIAL_ADMIN_PASSWORD_RAW);
    const fallbackAdmin: Usuario = {
      id: 'user-admin-master',
      nome: 'Roger Vasques Berchembrock',
      email: INITIAL_ADMIN_EMAIL,
      telefone: '11999999999',
      senha_hash: adminHash,
      role: 'admin',
      imobiliaria: 'Administração',
      instance_name: 'easymob_user_admin_master',
      created_at: new Date().toISOString(),
    };
    globalUsersStore.unshift(fallbackAdmin);
    return fallbackAdmin;
  }

  return null;
}

/**
 * Busca todos os usuários cadastrados (sem expor senha_hash)
 */
export async function getAllUsers(): Promise<Usuario[]> {
  try {
    const { data: dbUsers, error } = await supabase
      .from('users')
      .select('id, nome, email, telefone, role, imobiliaria, instance_name, avatar_url, created_at')
      .order('created_at', { ascending: false });

    if (!error && dbUsers && dbUsers.length > 0) {
      return dbUsers.map((u) => ({
        ...u,
        instance_name: u.instance_name || generateInstanceName(u.id),
      }));
    }
  } catch {
    // Fallback
  }

  return globalUsersStore.map(({ id, nome, email, telefone, role, imobiliaria, instance_name, avatar_url, created_at }) => ({
    id,
    nome,
    email,
    telefone,
    role,
    imobiliaria,
    instance_name: instance_name || generateInstanceName(id),
    avatar_url,
    created_at,
  }));
}

/**
 * Cadastra um novo usuário
 */
export async function createUser(user: Omit<Usuario, 'id' | 'created_at'>): Promise<Usuario> {
  const newId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const instanceName = user.instance_name || generateInstanceName(newId);

  const newUser: Usuario = {
    id: newId,
    nome: user.nome,
    email: user.email.toLowerCase().trim(),
    telefone: user.telefone,
    senha_hash: user.senha_hash,
    role: user.role,
    imobiliaria: user.imobiliaria,
    instance_name: instanceName,
    avatar_url: user.avatar_url,
    created_at: now,
  };

  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        nome: newUser.nome,
        email: newUser.email,
        telefone: newUser.telefone,
        senha_hash: newUser.senha_hash,
        role: newUser.role,
        imobiliaria: newUser.imobiliaria,
        instance_name: newUser.instance_name,
      })
      .select()
      .single();

    if (!error && data) {
      newUser.id = data.id;
      if (data.instance_name) {
        newUser.instance_name = data.instance_name;
      }
    }
  } catch {
    // Fallback
  }

  // Atualiza store local
  globalUsersStore.push(newUser);
  return newUser;
}

/**
 * Remove um usuário do sistema
 */
export async function deleteUser(id: string): Promise<boolean> {
  try {
    await supabase.from('users').delete().eq('id', id);
  } catch {
    // Fallback
  }

  globalUsersStore = globalUsersStore.filter((u) => u.id !== id);
  return true;
}

/**
 * Atualiza os dados de um usuário pelo Administrador
 */
export async function updateUser(
  id: string,
  updates: {
    nome?: string;
    email?: string;
    telefone?: string;
    role?: 'admin' | 'corretor';
    imobiliaria?: string;
    password?: string;
  }
): Promise<Usuario | null> {
  let senhaHash: string | undefined;
  if (updates.password && updates.password.trim().length > 0) {
    senhaHash = await hashPassword(updates.password.trim());
  }

  const normalizedEmail = updates.email ? updates.email.toLowerCase().trim() : undefined;

  const dbUpdate: Record<string, unknown> = {};
  if (updates.nome) dbUpdate.nome = updates.nome;
  if (normalizedEmail) dbUpdate.email = normalizedEmail;
  if (updates.telefone !== undefined) dbUpdate.telefone = updates.telefone;
  if (updates.role) dbUpdate.role = updates.role;
  if (updates.imobiliaria) dbUpdate.imobiliaria = updates.imobiliaria;
  if (senhaHash) dbUpdate.senha_hash = senhaHash;

  try {
    const { data, error } = await supabase
      .from('users')
      .update(dbUpdate)
      .eq('id', id)
      .select('id, nome, email, telefone, role, imobiliaria, instance_name, avatar_url, created_at')
      .single();

    if (!error && data) {
      const updatedUser: Usuario = {
        id: data.id,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        role: data.role as 'admin' | 'corretor',
        imobiliaria: data.imobiliaria,
        instance_name: data.instance_name || generateInstanceName(data.id),
        avatar_url: data.avatar_url,
        created_at: data.created_at,
      };

      const idx = globalUsersStore.findIndex((u) => u.id === id);
      if (idx >= 0) {
        globalUsersStore[idx] = {
          ...globalUsersStore[idx],
          ...updatedUser,
          ...(senhaHash ? { senha_hash: senhaHash } : {}),
        };
      }

      return updatedUser;
    }
  } catch (err) {
    console.warn('[Auth] Erro ao atualizar usuário no Supabase:', err);
  }

  // Fallback em memória
  const idx = globalUsersStore.findIndex((u) => u.id === id);
  if (idx >= 0) {
    globalUsersStore[idx] = {
      ...globalUsersStore[idx],
      ...(updates.nome ? { nome: updates.nome } : {}),
      ...(normalizedEmail ? { email: normalizedEmail } : {}),
      ...(updates.telefone !== undefined ? { telefone: updates.telefone } : {}),
      ...(updates.role ? { role: updates.role } : {}),
      ...(updates.imobiliaria ? { imobiliaria: updates.imobiliaria } : {}),
      ...(senhaHash ? { senha_hash: senhaHash } : {}),
    };
    return globalUsersStore[idx];
  }

  return null;
}

/**
 * Gera um token de recuperação de senha com validade de 1 hora
 */
export async function createPasswordResetToken(email: string): Promise<{ token: string; user: Usuario } | null> {
  const user = await findUserByEmailForAuth(email);
  if (!user) return null;

  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    nome: user.nome,
    type: 'password_reset',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(JWT_SECRET);

  return { token, user };
}

/**
 * Valida o token de recuperação de senha
 */
export async function validatePasswordResetToken(token: string): Promise<{ valid: boolean; email?: string; userId?: string; error?: string }> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== 'password_reset' || !payload.email || !payload.sub) {
      return { valid: false, error: 'Token de recuperação inválido ou com tipo incorreto.' };
    }
    return { valid: true, email: payload.email as string, userId: payload.sub as string };
  } catch {
    return { valid: false, error: 'O link de recuperação expirou ou é inválido. Solicite um novo link.' };
  }
}

/**
 * Redefine a senha com o token de recuperação
 */
export async function resetPasswordWithToken(token: string, newPasswordRaw: string): Promise<{ success: boolean; error?: string }> {
  const validation = await validatePasswordResetToken(token);
  if (!validation.valid || !validation.userId) {
    return { success: false, error: validation.error || 'Token inválido ou expirado.' };
  }

  const newHash = await hashPassword(newPasswordRaw);

  try {
    await supabase
      .from('users')
      .update({ senha_hash: newHash })
      .eq('id', validation.userId);
  } catch (dbErr) {
    console.warn('[Auth] Erro ao redefinir senha no Supabase:', dbErr);
  }

  const idx = globalUsersStore.findIndex((u) => u.id === validation.userId || u.email.toLowerCase() === validation.email?.toLowerCase());
  if (idx >= 0) {
    globalUsersStore[idx].senha_hash = newHash;
  }

  return { success: true };
}

/**
 * Cria um novo convite com validade de 24h
 */
export async function createInvite(imobiliaria: string): Promise<Convite> {
  const token = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `tok-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const newInvite: Convite = {
    id: `inv-${Date.now()}`,
    token,
    imobiliaria: imobiliaria.trim() || 'EasyMob Imóveis',
    expires_at: expiresAt,
    used: false,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('invites')
      .insert({
        token: newInvite.token,
        imobiliaria: newInvite.imobiliaria,
        expires_at: newInvite.expires_at,
        used: false,
      })
      .select()
      .single();

    if (!error && data) {
      newInvite.id = data.id;
    }
  } catch {
    // Fallback
  }

  globalInvitesStore.push(newInvite);
  return newInvite;
}

/**
 * Valida um token de convite
 */
export async function validateInviteToken(token: string): Promise<{ valid: boolean; invite?: Convite; error?: string }> {
  if (!token) {
    return { valid: false, error: 'Token não fornecido.' };
  }

  let invite: Convite | null = null;

  try {
    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .eq('token', token)
      .single();

    if (!error && data) {
      invite = data;
    }
  } catch {
    // Fallback
  }

  if (!invite) {
    invite = globalInvitesStore.find((i) => i.token === token) || null;
  }

  if (!invite) {
    return { valid: false, error: 'Convite não encontrado ou inválido.' };
  }

  if (invite.used) {
    return { valid: false, error: 'Este convite já foi utilizado anteriormente.' };
  }

  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return { valid: false, error: 'Este convite expirou (validade de 24 horas excedida).' };
  }

  return { valid: true, invite };
}

/**
 * Marca o convite como utilizado
 */
export async function markInviteAsUsed(token: string): Promise<boolean> {
  try {
    await supabase.from('invites').update({ used: true }).eq('token', token);
  } catch {
    // Fallback
  }

  const local = globalInvitesStore.find((i) => i.token === token);
  if (local) {
    local.used = true;
  }
  return true;
}

/**
 * Lista todos os convites gerados
 */
export async function getAllInvites(): Promise<Convite[]> {
  try {
    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data;
    }
  } catch {
    // Fallback
  }

  return globalInvitesStore;
}

/**
 * Gera hash seguro de senha com bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compara a senha informada com o hash bcrypt
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Cria token de sessão JWT assinado
 */
export async function createSessionToken(
  user: UserSession,
  rememberMe: boolean = true
): Promise<{ token: string; maxAge: number }> {
  // 30 dias se 'lembrar-me', 1 dia se desmarcado
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
  const expiresAt = Math.floor(Date.now() / 1000) + maxAge;

  const instanceName = user.instance_name || generateInstanceName(user.id);

  const token = await new SignJWT({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    imobiliaria: user.imobiliaria,
    instance_name: instanceName,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(JWT_SECRET);

  return { token, maxAge };
}

/**
 * Valida o token de sessão JWT
 */
export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!payload || !payload.sub) {
      return null;
    }

    return {
      id: payload.sub as string,
      name: (payload.name as string) || 'Usuário',
      email: (payload.email as string) || '',
      role: (payload.role as 'admin' | 'corretor') || 'corretor',
      avatar: payload.avatar as string | undefined,
      imobiliaria: (payload.imobiliaria as string) || 'EasyMob',
      instance_name: (payload.instance_name as string) || generateInstanceName(payload.sub as string),
    };
  } catch {
    return null;
  }
}

/**
 * Obtém a sessão do usuário atual a partir dos cookies do servidor
 */
export async function getSessionUser(): Promise<UserSession | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return null;
    }

    return verifySessionToken(sessionCookie.value);
  } catch {
    return null;
  }
}
