export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) {
    return 'Good Morning';
  }
  if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  }
  return 'Good Evening';
}

export default getTimeBasedGreeting;

