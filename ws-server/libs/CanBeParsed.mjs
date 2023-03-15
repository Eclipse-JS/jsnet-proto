export function canBeParsedAsJSON(...data) {
  for (const i in data) {
    try {
      JSON.parse(data);
    } catch (e) {
      return false;
    }
  }

  return true;
}