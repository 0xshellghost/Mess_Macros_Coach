/**
 * Generates a realistic hostel mess whiteboard image as base64 JPEG
 * for instant one-click demonstration of Gemini Vision OCR parsing.
 */
export function generateSampleMessWhiteboardBase64(): { base64: string; mimeType: string } {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { base64: '', mimeType: 'image/jpeg' };
  }

  // Whiteboard background with subtle gloss
  ctx.fillStyle = '#F3F4F6';
  ctx.fillRect(0, 0, 900, 700);

  // Aluminum frame
  ctx.strokeStyle = '#9CA3AF';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 886, 686);

  // Inner border
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, 864, 664);

  // Whiteboard header
  ctx.font = 'bold 32px -apple-system, sans-serif';
  ctx.fillStyle = '#1E3A8A'; // Blue marker
  ctx.fillText('HOSTEL-4 MESS ROSTER — TODAY\'S MENU', 50, 70);

  // Date / Note
  ctx.font = 'italic 18px -apple-system, sans-serif';
  ctx.fillStyle = '#4B5563';
  ctx.fillText('Please show mess ID card at counter • Strictly no outside utensils', 50, 105);

  // Divider
  ctx.strokeStyle = '#EF4444'; // Red marker divider
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(50, 120);
  ctx.lineTo(850, 120);
  ctx.stroke();

  // Meals layout
  const meals = [
    {
      title: 'BREAKFAST (7:30 AM - 9:30 AM)',
      color: '#B91C1C',
      items: ['• Poha with peanuts & sev', '• Boiled Kala Chana Chaat', '• Bread + Butter / Mixed Fruit Jam', '• Hot Masala Chai / Milk (1 glass)'],
    },
    {
      title: 'LUNCH (12:30 PM - 2:30 PM)',
      color: '#15803D',
      items: ['• Punjabi Rajma Masala', '• Steamed Basmati Rice', '• Phulka Roti (Unlimited)', '• Plain Fresh Dahi (1 katori)', '• Green Salad (Cucumber, Onion, Lemon)'],
    },
    {
      title: 'EVENING SNACKS (5:00 PM - 6:15 PM)',
      color: '#B45309',
      items: ['• Aloo Samosa (1 pc) with Green Chutney', '• Hot Adrak Chai'],
    },
    {
      title: 'DINNER (7:30 PM - 9:45 PM)',
      color: '#1D4ED8',
      items: ['• Dal Tadka (Yellow Arhar Dal)', '• Aloo Gobhi Dry Sabzi', '• Hot Chapati with Ghee', '• Jeera Rice', '• Gulab Jamun (1 pc)'],
    },
  ];

  let y = 165;
  meals.forEach((m) => {
    // Meal title
    ctx.font = 'bold 22px -apple-system, sans-serif';
    ctx.fillStyle = m.color;
    ctx.fillText(m.title, 50, y);
    y += 30;

    // Items
    ctx.font = '500 18px -apple-system, sans-serif';
    ctx.fillStyle = '#111827';
    m.items.forEach((item) => {
      ctx.fillText(item, 70, y);
      y += 24;
    });

    y += 18;
  });

  // Footer notes in marker
  ctx.font = 'italic 16px -apple-system, sans-serif';
  ctx.fillStyle = '#6B7280';
  ctx.fillText('* Egg Bhurji & Boiled Eggs available on counter coupon (₹14/2 pcs)', 50, 660);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  return {
    base64: dataUrl.split(',')[1],
    mimeType: 'image/jpeg',
  };
}
