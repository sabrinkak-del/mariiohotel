// Mobile navigation toggle
const mobileMenu = document.getElementById('mobile-menu');
const navbar = document.querySelector('.navbar');

// Toggle background on scroll
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

if (mobileMenu && navbar) {
  mobileMenu.addEventListener('click', () => {
    navbar.classList.toggle('open');
  });
}

// ---------------------------------------------------------
// Booking Logic
// ---------------------------------------------------------

let bookingData = {
  checkin: '',
  checkout: '',
  guests: '2',
  roomName: '',
  roomPrice: 0,
  totalPrice: 0,
  nights: 0
};

// 1. Handle "Search Availability" with Simulation
const searchForm = document.getElementById('search-form');
if (searchForm) {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const guests = document.getElementById('guests').value;

    if (!checkin || !checkout) {
      alert('נא לבחור תאריכי הגעה ועזיבה');
      return;
    }

    // Save state
    bookingData.checkin = checkin;
    bookingData.checkout = checkout;
    bookingData.guests = guests;

    // Calculate nights
    const d1 = new Date(checkin);
    const d2 = new Date(checkout);
    const timeDiff = d2.getTime() - d1.getTime();
    bookingData.nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (bookingData.nights <= 0) {
      alert('תאריך העזיבה חייב להיות אחרי תאריך ההגעה');
      return;
    }

    /* ---------------------------------------------------------
       SIMULATE AVAILABILITY
       We use a simple hash of the date string to make it consistent.
       If Hash % 3 === 0, then a room might be taken.
    --------------------------------------------------------- */

    // Reset all rooms first
    document.querySelectorAll('.room-card').forEach(card => {
      card.classList.remove('sold-out');
      const btn = card.querySelector('.book-now-btn');
      if (btn) {
        btn.disabled = false;
        btn.innerText = 'שריין חדר זה';
      }
    });

    const dateHash = (checkin + checkout).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const rooms = document.querySelectorAll('.room-card');

    // Logic: In high season (hash is even), random rooms are sold out
    let availableCount = 0;

    rooms.forEach((card, index) => {
      // Create a pseudo-random determination for this specific room & date combo
      const isSoldOut = (dateHash + index) % 3 === 0;

      if (isSoldOut) {
        card.classList.add('sold-out');
        const btn = card.querySelector('.book-now-btn');
        if (btn) {
          btn.disabled = true;
          btn.innerText = 'אזל במלאי';
        }
      } else {
        availableCount++;
      }
    });

    // Scroll to rooms to show results
    document.getElementById('rooms').scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
      if (availableCount === 0) {
        alert(`לצערנו כל החדרים תפוסים בתאריכים ${checkin} עד ${checkout}. נסו תאריכים אחרים.`);
      } else {
        // Optional success notification could go here
      }
    }, 800);
  });
}

// 2. Handle "Book Now" clicked on rooms
const modal = document.getElementById('checkout-modal');
const closeModal = document.querySelector('.close-modal');
const summaryDiv = document.getElementById('order-summary');

document.querySelectorAll('.book-now-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Check if dates are selected
    if (!bookingData.checkin || !bookingData.checkout) {
      alert('אנא בחרו תאריכים בחלק העליון של הדף ולחצו על "חפש" קודם.');
      document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Get room data
    const card = e.target.closest('.room-card');
    bookingData.roomName = card.getAttribute('data-name');
    bookingData.roomPrice = parseInt(card.getAttribute('data-price'));
    bookingData.totalPrice = bookingData.roomPrice * bookingData.nights;

    // Update Modal UI
    summaryDiv.innerHTML = `
      <p><strong>חדר:</strong> ${bookingData.roomName}</p>
      <p><strong>תאריכים:</strong> ${bookingData.checkin} ➡ ${bookingData.checkout}</p>
      <p><strong>לילות:</strong> ${bookingData.nights}</p>
      <p><strong>אורחים:</strong> ${bookingData.guests}</p>
      <p style="font-size: 1.2rem; color: var(--color-gold); margin-top:10px;">
         <strong>סה"כ לתשלום: ₪${bookingData.totalPrice.toLocaleString()}</strong>
      </p>
    `;

    // Show Modal
    modal.classList.remove('hidden');
  });
});

// Close Modal logic
if (closeModal) {
  closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
}
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.add('hidden');
  }
});

// 3. Handle Payment & Mock Credit Card Processing
const paymentForm = document.getElementById('payment-form');
if (paymentForm) {
  paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Basic Validation (HTML5 handles most of it)
    const cardNum = document.getElementById('card-number').value.replace(/\s/g, '');
    const expiry = document.getElementById('card-expiry').value;
    const cvc = document.getElementById('card-cvc').value;
    const guestName = document.getElementById('guest-name').value;
    const guestEmail = document.getElementById('guest-email').value;

    if (cardNum.length < 16 || isNaN(cardNum)) {
      alert('מספר אשראי לא תקין');
      return;
    }
    if (cvc.length < 3 || isNaN(cvc)) {
      alert('קוד CVV לא תקין');
      return;
    }

    // 2. Simulate Payment Processing
    const payBtn = document.getElementById('pay-now-btn');
    const msg = document.getElementById('payment-message');

    payBtn.disabled = true;
    payBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> מסליק תשלום...';
    msg.style.display = 'block';

    // Simulate 2 seconds delay
    setTimeout(async () => {
      // 3. Prepare Payload
      const payload = {
        ...bookingData,
        guestName,
        guestEmail,
        paymentMethod: 'Credit Card (Simulated)',
        last4: cardNum.slice(-4)
      };

      try {
        // 4. Send to Backend
        const response = await fetch('http://localhost:3000/api/booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
          modal.classList.add('hidden');
          alert(`הזמנה אושרה בהצלחה! אישור נשלח למייל: ${guestEmail}`);

          // Reset forms
          document.getElementById('search-form').reset();
          paymentForm.reset();
          bookingData = {
            checkin: '',
            checkout: '',
            guests: '2',
            roomName: '',
            roomPrice: 0,
            totalPrice: 0,
            nights: 0
          };

          // Refresh page to reset room availability visual state (optional)
          window.location.reload();
        } else {
          alert('שגיאה בביצוע ההזמנה. אנא נסה שנית.');
        }
      } catch (error) {
        console.error(error);
        alert('שגיאה בתקשורת עם השרת.');
      } finally {
        payBtn.disabled = false;
        payBtn.innerText = 'בצע תשלום ושריין חדר';
        msg.style.display = 'none';
      }
    }, 2000);
  });

  // Optional: Format Credit Card Input with spaces
  const cardInput = document.getElementById('card-number');
  if (cardInput) {
    cardInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      let matches = v.match(/\d{4,16}/g);
      let match = matches && matches[0] || '';
      let parts = [];
      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }
      if (parts.length) {
        e.target.value = parts.join(' ');
      } else {
        e.target.value = v;
      }
    });
  }
}

// ---------------------------------------------------------
// Contact Form Logic (Legacy)
// ---------------------------------------------------------
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('button');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'שולח...';
    submitBtn.disabled = true;

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        alert('ההודעה נשלחה בהצלחה! נחזור אליכם בהקדם.');
        contactForm.reset();
      } else {
        alert('שגיאה בשליחת ההודעה.');
      }
    } catch (error) {
      alert('שגיאה בתקשורת.');
    } finally {
      submitBtn.innerText = originalText;
      submitBtn.disabled = false;
    }
  });
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href').substring(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
