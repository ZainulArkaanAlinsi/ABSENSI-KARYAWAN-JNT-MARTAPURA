import anime from 'animejs';
console.log('Anime default export:', typeof anime);
try {
  const { animate } = await import('animejs');
  console.log('Animate named export:', typeof animate);
} catch (e) {
  console.log('Animate named export: FAILED');
}
