import { supabase, POST_IMAGES_BUCKET } from './supabaseClient'

export function buildExcerpt(body) {
  const trimmed = body.trim()
  return trimmed.length > 140 ? trimmed.slice(0, 140).trim() + '…' : trimmed
}

function initialOf(name) {
  return (name || '?').trim().charAt(0).toUpperCase() || '?'
}

function normalizePost(row, { likedIds, followingIds, commentCounts, likeCounts, currentUserId }) {
  return {
    id: row.id,
    authorId: row.author_id,
    author: row.profiles?.name || 'Alguien',
    authorInitial: initialOf(row.profiles?.name),
    you: currentUserId ? row.author_id === currentUserId : false,
    topic: row.topic,
    title: row.title,
    body: row.body,
    excerpt: buildExcerpt(row.body),
    image: row.image_url,
    createdAt: row.created_at,
    likes: likeCounts.get(row.id) || 0,
    liked: likedIds.has(row.id),
    commentsCount: commentCounts.get(row.id) || 0,
    followingAuthor: followingIds.has(row.author_id),
  }
}

async function countByPostId(table, postIds) {
  const counts = new Map()
  if (postIds.length === 0) return counts
  const { data, error } = await supabase.from(table).select('post_id').in('post_id', postIds)
  if (error) throw error
  for (const row of data) {
    counts.set(row.post_id, (counts.get(row.post_id) || 0) + 1)
  }
  return counts
}

async function myLikedPostIds(userId, postIds) {
  if (!userId || postIds.length === 0) return new Set()
  const { data, error } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', postIds)
  if (error) throw error
  return new Set(data.map((r) => r.post_id))
}

async function myFollowingIds(userId) {
  if (!userId) return new Set()
  const { data, error } = await supabase.from('follows').select('followed_id').eq('follower_id', userId)
  if (error) throw error
  return new Set(data.map((r) => r.followed_id))
}

async function attachSocialData(rows, currentUserId) {
  const postIds = rows.map((r) => r.id)
  const [likeCounts, commentCounts, likedIds, followingIds] = await Promise.all([
    countByPostId('likes', postIds),
    countByPostId('comments', postIds),
    myLikedPostIds(currentUserId, postIds),
    myFollowingIds(currentUserId),
  ])
  return rows.map((row) =>
    normalizePost(row, { likedIds, followingIds, commentCounts, likeCounts, currentUserId })
  )
}

const POST_SELECT = 'id, author_id, topic, title, body, image_url, created_at, profiles:author_id ( name )'

export async function fetchFeed({ topic, currentUserId }) {
  let query = supabase.from('posts').select(POST_SELECT).order('created_at', { ascending: false })
  if (topic && topic !== 'Todos') query = query.eq('topic', topic)
  const { data, error } = await query
  if (error) throw error
  return attachSocialData(data, currentUserId)
}

export async function fetchMyPosts(userId) {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return attachSocialData(data, userId)
}

export async function fetchPost(id, currentUserId) {
  const { data, error } = await supabase.from('posts').select(POST_SELECT).eq('id', id).maybeSingle()
  if (error) throw error
  if (!data) return null
  const [post] = await attachSocialData([data], currentUserId)
  return post
}

export async function fetchComments(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select('id, text, created_at, author_id, profiles:author_id ( name )')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map((c) => ({
    id: c.id,
    text: c.text,
    createdAt: c.created_at,
    author: c.profiles?.name || 'Alguien',
    authorInitial: initialOf(c.profiles?.name),
  }))
}

export async function addComment({ postId, authorId, text }) {
  const { error } = await supabase.from('comments').insert({ post_id: postId, author_id: authorId, text })
  if (error) throw error
}

export async function toggleLike({ postId, userId, liked }) {
  if (liked) {
    const { error } = await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', userId)
    if (error) throw error
  } else {
    const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: userId })
    if (error) throw error
  }
}

export async function toggleFollow({ followerId, followedId, following }) {
  if (following) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('followed_id', followedId)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, followed_id: followedId })
    if (error) throw error
  }
}

export async function fetchFollowingList(userId) {
  const followingIds = await myFollowingIds(userId)
  const ids = Array.from(followingIds)
  if (ids.length === 0) return []

  const [{ data: profiles, error: profErr }, { data: latestPosts, error: postsErr }] = await Promise.all([
    supabase.from('profiles').select('id, name').in('id', ids),
    supabase
      .from('posts')
      .select('author_id, topic, title, id, created_at')
      .in('author_id', ids)
      .order('created_at', { ascending: false }),
  ])
  if (profErr) throw profErr
  if (postsErr) throw postsErr

  const latestByAuthor = new Map()
  for (const p of latestPosts) {
    if (!latestByAuthor.has(p.author_id)) latestByAuthor.set(p.author_id, p)
  }

  return profiles.map((p) => ({
    id: p.id,
    name: p.name,
    initial: initialOf(p.name),
    latestPost: latestByAuthor.get(p.id) || null,
  }))
}

export async function fetchProfileWithStats(userId) {
  const [{ data: profile, error: profErr }, postsCount, followersCount, followingCount] = await Promise.all([
    supabase.from('profiles').select('id, name, bio, avatar_url, created_at').eq('id', userId).maybeSingle(),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', userId),
    supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('followed_id', userId),
    supabase.from('follows').select('followed_id', { count: 'exact', head: true }).eq('follower_id', userId),
  ])
  if (profErr) throw profErr
  return {
    profile,
    postsCount: postsCount.count || 0,
    followersCount: followersCount.count || 0,
    followingCount: followingCount.count || 0,
  }
}

export async function updateProfile({ userId, name, bio }) {
  const { error } = await supabase.from('profiles').update({ name, bio }).eq('id', userId)
  if (error) throw error
}

export async function uploadPostImage({ file, userId }) {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from(POST_IMAGES_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from(POST_IMAGES_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function createPost({ authorId, topic, title, body, imageFile }) {
  let imageUrl = null
  if (imageFile) {
    imageUrl = await uploadPostImage({ file: imageFile, userId: authorId })
  }
  const { data, error } = await supabase
    .from('posts')
    .insert({ author_id: authorId, topic, title, body, image_url: imageUrl })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}
