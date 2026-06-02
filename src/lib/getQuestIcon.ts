// Import your custom icons
import questIcon1 from '../assets/Quest_icon_1.png'
import questIcon2 from '../assets/Quest_icon_2.png'
import questIcon3 from '../assets/Quest_icon_3.png'

const iconMap: { [key: string]: string } = {
  'Quest_icon_1': questIcon1,
  'Quest_icon_2': questIcon2,
  'Quest_icon_3': questIcon3,
}

export const getQuestIcon = (iconName: string | undefined) => {
  if (!iconName) return questIcon1; // Fallback if icon is null or undefined
  return iconMap[iconName] || questIcon1 // Fallback to a default icon
}