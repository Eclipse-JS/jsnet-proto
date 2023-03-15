export function canBeParsedAsJSON(...data) {
  for (const i in data) {
    try {
      JSON.parse(i);
    } catch (e) {
      return false;
    }
  }

  return true;
}