function toggleMobileMenu(menuOpen: boolean, setState: (arg0: any) => void): void {
  const mO = !menuOpen;
  setState({ menuOpen: mO });
}

function handleKeyMenu(e: { key: string; }, menuOpen: boolean, setState: (arg0: any) => void): void {
  if (e.key === 'Enter') toggleMobileMenu(menuOpen, setState);
}

export default { toggleMobileMenu, handleKeyMenu };
