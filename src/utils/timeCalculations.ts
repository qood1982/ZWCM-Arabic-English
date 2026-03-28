export const calculateHoursRemaining = (validTo: string, validToTime: string): number => {
  if (!validTo || !validToTime) return 0;
  
  try {
    // Parse the date and time
    const [month, day, year] = validTo.split('/');
    const fullYear = year.length === 2 ? `20${year}` : year;
    
    // Parse time (handles both 12-hour and 24-hour formats)
    let hours = 0, minutes = 0, seconds = 0;
    
    if (validToTime.includes(':')) {
      const timeParts = validToTime.split(':');
      hours = parseInt(timeParts[0]);
      minutes = parseInt(timeParts[1]);
      
      // Handle seconds if present
      if (timeParts[2]) {
        const secParts = timeParts[2].split(' ');
        seconds = parseInt(secParts[0]);
        
        // Handle AM/PM
        if (secParts[1]) {
          const period = secParts[1].toUpperCase();
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
        }
      }
    }
    
    const expirationDate = new Date(
      parseInt(fullYear),
      parseInt(month) - 1,
      parseInt(day),
      hours,
      minutes,
      seconds
    );
    
    const now = new Date();
    const diffMs = expirationDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return Math.round(diffHours * 10) / 10; // Round to 1 decimal place
  } catch (error) {
    console.error('Error calculating hours:', error);
    return 0;
  }
};

export const getExpirationStatus = (hoursRemaining: number, warningThreshold: number = 12): 'expired' | 'warning' | 'active' => {
  if (hoursRemaining <= 0) return 'expired';
  if (hoursRemaining <= warningThreshold) return 'warning';
  return 'active';
};

export const formatHoursRemaining = (hours: number): string => {
  const totalHours = Math.round(hours);
  if (totalHours <= 0) {
    return `${totalHours}H`;
  }
  return `${totalHours}H`;
};

export const formatDateTime = (date: string, time: string): string => {
  if (!date || !time) return 'N/A';
  
  try {
    const [month, day, year] = date.split('/');
    const fullYear = year.length === 2 ? `20${year}` : year;
    
    let hours = 0, minutes = 0;
    
    if (time.includes(':')) {
      const timeParts = time.split(':');
      hours = parseInt(timeParts[0]);
      minutes = parseInt(timeParts[1]);
      
      if (timeParts[2]) {
        const secParts = timeParts[2].split(' ');
        if (secParts[1]) {
          const period = secParts[1].toUpperCase();
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
        }
      }
    }
    
    const dateObj = new Date(
      parseInt(fullYear),
      parseInt(month) - 1,
      parseInt(day),
      hours,
      minutes
    );
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
    const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    return `${formattedDate} at ${formattedTime}`;
  } catch (error) {
    return `${date} ${time}`;
  }
};
