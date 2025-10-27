import React from 'react';
import PlayLessonIcon from '@mui/icons-material/PlayLesson';
import QuizIcon from '@mui/icons-material/Quiz';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CategoryIcon from '@mui/icons-material/Category';
import GradingIcon from '@mui/icons-material/Grading';
import StarIcon from '@mui/icons-material/Star';
import LocalActivityIcon from '@mui/icons-material/LocalActivity'; 
import SchoolIcon from '@mui/icons-material/School';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CircleIcon from '@mui/icons-material/Circle';

export const getActivityIcon = (activityType: string, activityName?: string): JSX.Element => {
  const type = (activityType || '').toLowerCase();
  const name = (activityName || '').toLowerCase();

  if (type === 'video' || name.includes('lesson')) {
    return React.createElement(PlayLessonIcon);
  }
  if (type === 'h5p' || name.includes('interactive')) {
    return React.createElement(LocalActivityIcon); 
  }
  if (type === 'practice_questions' || name.includes('practice')) {
    return React.createElement(QuizIcon);
  }
  if (name.includes('video')) return React.createElement(PlayLessonIcon);
  if (name.includes('interactive')) return React.createElement(LocalActivityIcon); 
  if (name.includes('practice')) return React.createElement(QuizIcon);
  if (name.includes('lesson')) return React.createElement(LibraryBooksIcon);
  if (name.includes('activity')) return React.createElement(GradingIcon);
  return React.createElement(LibraryBooksIcon);
};

export const getItemIcon = (type?: string, name?: any, customIcon?: JSX.Element): JSX.Element => {
  if (customIcon) return customIcon;
  
  const t = typeof type === 'string' ? type.toLowerCase() : '';
  const n = typeof name === 'string' ? name.toLowerCase() : '';

  switch (t) {
    case 'lesson':
    case 'learning_object':
      return React.createElement(LibraryBooksIcon);
    case 'video':
      return React.createElement(PlayLessonIcon);
    case 'h5p':
      return React.createElement(LocalActivityIcon); // ✅ updated
    case 'practice_questions':
    case 'practice_activity':
    case 'practice':
      return React.createElement(QuizIcon);
    case 'assessment':
      return React.createElement(GradingIcon);
    case 'exam':
      return React.createElement(StarIcon);
    case 'topic':
      return React.createElement(CategoryIcon);
    case 'activity':
      if (n.includes('video')) return React.createElement(PlayLessonIcon);
      if (n.includes('interactive')) return React.createElement(LocalActivityIcon); // ✅ updated
      if (n.includes('practice')) return React.createElement(QuizIcon);
      if (n.includes('lesson')) return React.createElement(LibraryBooksIcon);
      if (n.includes('game')) return React.createElement(SportsEsportsIcon);
      if (n.includes('quiz')) return React.createElement(HelpOutlineIcon);
      return React.createElement(GradingIcon);
    default:
      if (n.includes('video')) return React.createElement(PlayLessonIcon);
      if (n.includes('interactive')) return React.createElement(LocalActivityIcon); // ✅ updated
      if (n.includes('practice')) return React.createElement(QuizIcon);
      if (n.includes('exam')) return React.createElement(StarIcon);
      if (n.includes('topic')) return React.createElement(CategoryIcon);
      if (n.includes('activity')) return React.createElement(GradingIcon);
      if (n.includes('course')) return React.createElement(CategoryIcon);
      if (n.includes('quiz')) return React.createElement(HelpOutlineIcon);
      if (n.includes('reading')) return React.createElement(LibraryBooksIcon);
      if (n.includes('writing')) return React.createElement(CategoryIcon);
      if (n.includes('math')) return React.createElement(CategoryIcon);
      return React.createElement(LibraryBooksIcon);
  }
};

export const getLevelIcon = (level: 'course' | 'lesson' | 'topic' | 'activity', item?: any): JSX.Element => {
  switch (level) {
    case 'course':
      return React.createElement(CategoryIcon);
    case 'lesson':
      return React.createElement(SchoolIcon);
    case 'topic':
      return React.createElement(CategoryIcon);
    case 'activity':
      if (item) {
        return getActivityIcon(item.type, item.name);
      }
      return React.createElement(GradingIcon);
    default:
      return React.createElement(LibraryBooksIcon);
  }
};
