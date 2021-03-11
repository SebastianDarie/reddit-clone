export const formatFilename = (filename: string): string => {
  const date = new Date().toISOString().split('T')[0];
  const randomString = Math.random().toString(36).substring(2, 7);
  const cleanFileName = filename.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const newFilename = `posts/${date}-${randomString}-${cleanFileName}`;
  return newFilename.substring(0, 60);
};
