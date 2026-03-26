(function () {
    var form = document.querySelector('.contact-form');
    if (!form) return;

    var statusEl = form.querySelector('.contact-form-status');
    var submitBtn = form.querySelector('.contact-form-submit');
    var action = form.getAttribute('action') || '';

    if (action.indexOf('PLACEHOLDER') !== -1) {
        if (statusEl) {
            statusEl.className = 'contact-form-status is-error';
            statusEl.textContent =
                'This form is not connected yet. Replace PLACEHOLDER in contact.html with your Formspree form ID.';
        }
        if (submitBtn) submitBtn.disabled = true;
        return;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!statusEl || !submitBtn) return;

        statusEl.className = 'contact-form-status';
        statusEl.textContent = '';
        submitBtn.disabled = true;

        var fd = new FormData(form);

        fetch(form.action, {
            method: 'POST',
            body: fd,
            headers: { Accept: 'application/json' },
        })
            .then(function (res) {
                return res.json().then(
                    function (data) {
                        return { ok: res.ok, data: data };
                    },
                    function () {
                        return { ok: false, data: null };
                    }
                );
            })
            .then(function (result) {
                if (result.ok) {
                    statusEl.className = 'contact-form-status is-success';
                    statusEl.textContent =
                        'Thanks — your message was sent. I will get back to you soon.';
                    form.reset();
                } else {
                    throw new Error('Submission failed');
                }
            })
            .catch(function () {
                statusEl.className = 'contact-form-status is-error';
                statusEl.textContent =
                    'Something went wrong. Please try again in a moment.';
            })
            .finally(function () {
                submitBtn.disabled = false;
            });
    });
})();
