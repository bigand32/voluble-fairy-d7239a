(function () {
    const form = document.getElementById('contact-form');
    const successEl = document.getElementById('contact-success');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const payload = {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim() || null,
            inquiry_type: document.getElementById('type').value,
            message: document.getElementById('message').value.trim()
        };

        const btn = form.querySelector('button[type=submit]');
        btn.disabled = true;
        const prevLabel = btn.textContent;
        btn.textContent = '전송 중...';

        const sb = window.supabaseClient;
        if (!sb) {
            btn.disabled = false;
            btn.textContent = prevLabel;
            alert('문의 접수 설정이 되어 있지 않습니다. 전화로 문의해 주세요.');
            return;
        }

        const { error } = await sb.from('contact_inquiries').insert(payload);

        btn.disabled = false;
        btn.textContent = prevLabel;

        if (error) {
            alert('문의 접수에 실패했습니다. 잠시 후 다시 시도하거나 전화로 문의해 주세요.');
            return;
        }

        form.reset();
        successEl.classList.add('show');
        successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
})();
