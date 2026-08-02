/**
 * Resolves the display URL for a user profile picture.
 * Prioritizes uploaded image paths from user or details state over default fallback avatars.
 * Prevents default avatar overwrites on page refresh, server restart, or session restore.
 */
export const getProfilePictureUrl = (user, details, defaultAvatar) => {
  const pic =
    user?.profile_picture ||
    user?.profilePicture ||
    user?.avatar ||
    details?.profile_picture ||
    details?.profilePicture ||
    details?.avatar ||
    details?.user?.profile_picture ||
    details?.user?.profilePicture;

  if (!pic) {
    return defaultAvatar;
  }

  // If full URL (http, https, blob, data), return as is
  if (pic.startsWith('http://') || pic.startsWith('https://') || pic.startsWith('data:') || pic.startsWith('blob:')) {
    return pic;
  }

  // Clean relative path (e.g. /uploads/profile-1-12345.png)
  const cleanPath = pic.startsWith('/') ? pic : `/${pic}`;
  return cleanPath;
};
