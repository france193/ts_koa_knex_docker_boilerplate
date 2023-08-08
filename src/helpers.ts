export function generateRandomUrl() {
  return `https://${generateRandomString(8)}.com/${generateRandomString(4)}`;
}

function generateRandomString(length: number): string {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomUrl = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomUrl += characters.charAt(randomIndex);
  }

  return randomUrl;
}
