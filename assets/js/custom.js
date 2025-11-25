// 11 LD – kontaktų formos logika, validacija ir telefono formatavimas

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const resultsDiv = document.querySelector('#form-results');
  const averageP = document.querySelector('#form-average');
  const successMsg = document.querySelector('#form-success');
  const submitBtn = document.querySelector('#contact-submit');

  // Pagalbinės funkcijos
  function onlyLetters(value) {
    return /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž\s-]+$/.test(value);
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateRatingValue(value) {
    if (!value) {
      return { valid: false, message: 'Įveskite įvertinimą (1–10)' };
    }
    const n = Number(value);
    if (Number.isNaN(n) || n < 1 || n > 10) {
      return { valid: false, message: 'Vertė turi būti tarp 1 ir 10' };
    }
    return { valid: true, message: '' };
  }

  function formatPhone(rawValue) {
    let digits = rawValue.replace(/\D/g, '');

    // Apribojam skaičių kiekį
    if (!digits) return '';
    digits = digits.slice(0, 11);

    // Pabandome išvesti į +370 6xx xxxxx formatą
    // Įvairūs atvejai: 86..., 6..., 370..., kiti
    if (digits.startsWith('86')) {
      digits = '370' + digits.slice(1); // 86 -> 3706...
    } else if (digits.startsWith('6')) {
      digits = '370' + digits;         // 6... -> 3706...
    } else if (!digits.startsWith('370')) {
      digits = '3706' + digits;        // bet kas -> 3706...
    }

    // užtikrinam, kad prasidėtų 3706
    if (!digits.startsWith('3706')) {
      if (digits.startsWith('370')) {
        digits = digits.slice(0, 3) + '6' + digits.slice(3);
      } else {
        digits = '3706' + digits;
      }
    }

    digits = digits.slice(0, 11); // 3706 + 7 skaitmenys

    // formatavimas: +370 6xx xxxxx
    if (digits.length <= 3) {
      return '+' + digits;
    } else if (digits.length <= 4) {
      return '+' + digits.slice(0, 3) + ' ' + digits.slice(3);
    } else if (digits.length <= 5) {
      return '+' + digits.slice(0, 3) + ' ' + digits.slice(3);
    } else {
      const first = digits.slice(0, 3);   // 370
      const middle = digits.slice(3, 6);  // 6xx
      const last = digits.slice(6);       // xxxxx
      return '+' + first + ' ' + middle + (last ? ' ' + last : '');
    }
  }

  // Visi formos laukai ir jų validacija
  const fields = {
    firstName: {
      input: form.querySelector('#firstName'),
      error: form.querySelector('[data-error-for="firstName"]'),
      validator(value) {
        if (!value) return { valid: false, message: 'Įveskite vardą' };
        if (!onlyLetters(value)) return { valid: false, message: 'Vardas turi būti sudarytas tik iš raidžių' };
        return { valid: true, message: '' };
      },
      touched: false
    },
    lastName: {
      input: form.querySelector('#lastName'),
      error: form.querySelector('[data-error-for="lastName"]'),
      validator(value) {
        if (!value) return { valid: false, message: 'Įveskite pavardę' };
        if (!onlyLetters(value)) return { valid: false, message: 'Pavardė turi būti sudaryta tik iš raidžių' };
        return { valid: true, message: '' };
      },
      touched: false
    },
    email: {
      input: form.querySelector('#email'),
      error: form.querySelector('[data-error-for="email"]'),
      validator(value) {
        if (!value) return { valid: false, message: 'Įveskite el. paštą' };
        if (!validateEmail(value)) return { valid: false, message: 'Neteisingas el. pašto formatas' };
        return { valid: true, message: '' };
      },
      touched: false
    },
    phone: {
      input: form.querySelector('#phone'),
      error: form.querySelector('[data-error-for="phone"]'),
      validator(value) {
        if (!value) return { valid: false, message: 'Įveskite telefono numerį' };
        const pattern = /^\+370 6\d{2} \d{5}$/;
        if (!pattern.test(value)) {
          return { valid: false, message: 'Formatas turi būti: +370 6xx xxxxx' };
        }
        return { valid: true, message: '' };
      },
      touched: false
    },
    address: {
      input: form.querySelector('#address'),
      error: form.querySelector('[data-error-for="address"]'),
      validator(value) {
        if (!value) return { valid: false, message: 'Įveskite adresą' };
        return { valid: true, message: '' };
      },
      touched: false
    },
    rating1: {
      input: form.querySelector('#rating1'),
      error: form.querySelector('[data-error-for="rating1"]'),
      validator: validateRatingValue,
      touched: false
    },
    rating2: {
      input: form.querySelector('#rating2'),
      error: form.querySelector('[data-error-for="rating2"]'),
      validator: validateRatingValue,
      touched: false
    },
    rating3: {
      input: form.querySelector('#rating3'),
      error: form.querySelector('[data-error-for="rating3"]'),
      validator: validateRatingValue,
      touched: false
    }
  };

  function setError(fieldKey, valid, message) {
    const field = fields[fieldKey];
    if (!field || !field.input || !field.error) return;

    if (valid) {
      field.input.classList.remove('is-invalid');
      field.error.textContent = '';
    } else {
      field.input.classList.add('is-invalid');
      field.error.textContent = message;
    }
  }

  function validateField(fieldKey, showErrors = true) {
    const field = fields[fieldKey];
    if (!field || !field.input) return true;

    const value = field.input.value.trim();
    const { valid, message } = field.validator(value);

    if (showErrors && field.touched) {
      setError(fieldKey, valid, message);
    }

    return valid;
  }

  function isFormValid() {
    // patikrinam VISUS laukus (tinka ir nepaspaudus "submit")
    return Object.keys(fields).every((key) => {
      const field = fields[key];
      if (!field || !field.input) return true;
      const value = field.input.value.trim();
      return field.validator(value).valid;
    });
  }

  function updateSubmitState() {
    if (!submitBtn) return;
    submitBtn.disabled = !isFormValid();
  }

  // Real-time validacija ir telefono formatavimas
  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    if (!field || !field.input) return;

    field.input.addEventListener('input', () => {
      // telefono numeris – su formatavimu
      if (key === 'phone') {
        field.input.value = formatPhone(field.input.value);
      }

      field.touched = true;
      validateField(key, true);
      updateSubmitState();
    });
  });

  // Pradinė būsena – mygtukas neaktyvus
  updateSubmitState();

  // Formos pateikimas
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // priverstinai parodom klaidas, jei yra
    Object.keys(fields).forEach((key) => {
      fields[key].touched = true;
      validateField(key, true);
    });

    if (!isFormValid()) {
      if (successMsg) {
        successMsg.classList.add('d-none');
      }
      return;
    }

    // Surenkam duomenis į objektą
    const data = {
      firstName: fields.firstName.input.value.trim(),
      lastName: fields.lastName.input.value.trim(),
      email: fields.email.input.value.trim(),
      phone: fields.phone.input.value.trim(),
      address: fields.address.input.value.trim(),
      rating1: Number(fields.rating1.input.value),
      rating2: Number(fields.rating2.input.value),
      rating3: Number(fields.rating3.input.value)
    };

    // 4a) objektas – į konsolę
    console.log('Kontaktų formos duomenys:', data);

    // 4b) atvaizduojam po forma
    if (resultsDiv) {
      resultsDiv.innerHTML = `
        <p><strong>Vardas:</strong> ${data.firstName}</p>
        <p><strong>Pavardė:</strong> ${data.lastName}</p>
        <p><strong>El. paštas:</strong> ${data.email}</p>
        <p><strong>Tel. numeris:</strong> ${data.phone}</p>
        <p><strong>Adresas:</strong> ${data.address}</p>
        <p><strong>Įvertinimai:</strong> ${data.rating1}, ${data.rating2}, ${data.rating3}</p>
      `;
    }

    // 5) vidurkis
    const avg = ((data.rating1 + data.rating2 + data.rating3) / 3).toFixed(1);
    if (averageP) {
      averageP.textContent = `${data.firstName} ${data.lastName}: ${avg}`;
    }

    // 6) sėkmės pranešimas
    if (successMsg) {
      successMsg.classList.remove('d-none');
    }
  });
});
