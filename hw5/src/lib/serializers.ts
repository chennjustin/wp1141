export function serializeAuthor(author: any) {
  if (!author) return author
  const avatarUrl = author.avatarUrl ?? null
  const profileImage = avatarUrl || author.image || null
  return {
    ...author,
    avatarUrl,
    profileImage,
  }
}

