jQuery(document).ready(function ($) {
    const steps = $('.sproduct-step'),
        nextBtn = $('#next-btn'),
        prevBtn = $('#prev-btn'),
        submitBtn = $('#submit-btn'),
        form = $('#sproduct-main-form');
    let currentStep = parseInt(sessionStorage.getItem('currentStep')) || 0,
        formData = JSON.parse(sessionStorage.getItem('sproductFormData')) || {};
    showStep(currentStep);
    populateForm();
    function populateForm() {
        $.each(formData, (name, value) => {
            const input = $(`[name="${name}"]`);
            if (input.length) {
                if (input.attr('type') === 'checkbox') {
                    input.prop('checked', value === "1");
                } else {
                    input.val(value);
                }
            }
        });
    }
    function handleNavigation(change) {
        if (validateStep(currentStep)) {
            currentStep += change;
            showStep(currentStep);
            saveStepData();
        }
    }
    nextBtn.on('click', () => handleNavigation(1));
    prevBtn.on('click', () => handleNavigation(-1));
    
    submitBtn.on('click', (e) => {
        if (!validateStep(currentStep)) e.preventDefault();
    });

    form.on('submit', function (e) {
        e.preventDefault();
        let submittedFormData = $(this).serialize();
        let postID = $('#sproduct-form-frontend').attr('data-post-id');
        let planPrice = $('input[name=selected_plan]:checked').attr('data-plan-price');
        let planDuration = $('input[name=selected_plan]:checked').attr('data-plan-duration');
        let planName = $('input[name=selected_plan]:checked').val();
        let requestType = 'خرید سرویس جدید';
        // if (!$('input[name="selected_plan"]:checked').val()) {
        //     e.preventDefault();
        //     alert('Please select a subscription plan before submitting.');
        // } else if (!validateAll()) {
        //     e.preventDefault();
        // } else {
        //     saveStepData();
            $.ajax({
                url: sproductAjax.ajaxurl,
                method: 'POST',
                dataType: 'json',
                data: {
                    action: 'sproduct_submit_form',
                    submittedFormData: submittedFormData,
                    postID: postID,
                    planName: planName,
                    planPrice: planPrice,
                    planDuration: planDuration,
                    requestType: requestType,
                    // form_data: JSON.stringify(form.serialize()),
                    // post_id: form.closest('#sproduct-form-frontend').data('post-id'),
                    nonce: sproductAjax.nonce
                },
                success: (res) => {
                    console.log(res);
                },
                error: (xhr, status, error) => {
                    console.log(xhr.responseText);  // Log the server response
                    console.log(status, error);     // Log the status and error message
                    alert('خطا در ارسال فرم.');
                }
            });
        // }
    });
    function validateStep(stepIndex) {
        let isValid = true;
        const step = steps.eq(stepIndex);
        const validations = [
            {selector: 'input[type="tel"], input[type="telephone"]', message: 'شماره موبایل باید با 09 شروع شود و 11 رقم باشد.', condition: (v) => !/^09\d{9}$/.test(v)},
            {selector: 'input[type="email"]', message: 'ایمیل وارد شده معتبر نیست.', condition: (v) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
            {selector: 'input[type="nationalcode"]', message: 'کد ملی باید دقیقاً 10 رقم باشد.', condition: (v) => v.length !== 10}
        ];
        step.find('input, textarea').each(function () {
            const value = $(this).val().trim();
            const isRequired = $(this).closest('.is_required').length > 0;
            let fieldValid = true;
            if (isRequired && value === '') {
                showError($(this), 'پر کردن این فیلد اجباری است');
                fieldValid = false;
            } else {
                clearError($(this));
                if (value !== '') {
                    validations.forEach(({ selector, message, condition }) => {
                        if ($(this).is(selector) && condition(value)) {
                            showError($(this), message);
                            fieldValid = false;
                        }
                    });
                }
            }
            if (!fieldValid) {
                isValid = false;
            }
        });
        return isValid;
    }    
    function validateAll() {
        let isValid = true;
        form.find('input, textarea').each(function () {
            if ($(this).closest('.input-item').find('.required-checkbox').is(':checked') && !$(this).val().trim()) {
                showError($(this), 'پر کردن این فیلد اجباری است');
                isValid = false;
            } else {
                clearError($(this));
            }
        });
        return isValid;
    }
    function showStep(stepIndex) {
        steps.hide().eq(stepIndex).show();
        prevBtn.prop('disabled', stepIndex === 0);
        nextBtn.toggle(stepIndex !== steps.length - 1);
        submitBtn.toggle(stepIndex === steps.length - 1);
    }
    // form.on('input change', 'input, textarea, select', function () {
    //     const input = $(this);
    //     formData[input.attr('name')] = input.attr('type') === 'checkbox'
    //         ? input.is(':checked') ? "1" : "0"
    //         : input.val();
    //     sessionStorage.setItem('sproductFormData', JSON.stringify(formData));
    // });
    // function saveStepData() {
    //     steps.eq(currentStep).find('input, textarea, select').each(function () {
    //         const input = $(this);
    //         formData[input.attr('name')] = input.attr('type') === 'checkbox'
    //             ? input.is(':checked') ? "1" : "0"
    //             : input.val();
    //     });
    //     sessionStorage.setItem('sproductFormData', JSON.stringify(formData));
    //     sessionStorage.setItem('currentStep', currentStep);
    // }

    function showError(input, message) {
        clearError(input);
        input.addClass('input-error-border').after(`<div class="input-error" style="color: red; margin-top: 5px;">${message}</div>`);
    }

    function clearError(input) {
        input.removeClass('input-error-border').next('.input-error').remove();
    }

    const realTimeValidations = [
        { selector: 'input[type="telephone"]', pattern: /^\d{0,8}$/, message: 'The phone number cannot exceed 8 digits.' },
        { selector: 'input[type="tel"]', pattern: /^09\d{0,10}$/, message: 'شماره موبایل باید با 09 شروع شود' },
        { selector: 'input[type="email"]', pattern: /^[^\u0600-\u06FF]+$/, message: 'Enter your email in Latin' },
        { selector: 'input[type="nationalcode"]', pattern: /^\d*$/, message: 'Zip code must be entered as a number' }
    ];

    realTimeValidations.forEach(({ selector, pattern, message }) => {
        form.on('input', selector, function () {
            const input = $(this);
            const value = input.val().trim();
            if (!pattern.test(value)) {
                showError(input, message);
                input.val(value.replace(/\D/g, ''));
            } else {
                clearError(input);
            }
        });
    });
    form.on('keypress', 'input[type="tel"], input[type="nationalcode"]', function (e) {
        const charCode = e.which ? e.which : e.keyCode;
        if (charCode < 48 || charCode > 57) {
            e.preventDefault();
            showError($(this), 'لطفا فقط عدد وارد کنید');
        }
    });
});