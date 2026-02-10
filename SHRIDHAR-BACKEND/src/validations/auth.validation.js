const Joi = require('joi');

const register = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
        name: Joi.string().required(),
        role: Joi.string().valid('USER', 'TECHNICIAN').default('USER'),
        // Password is required only for USER. For TECHNICIAN, it's auto-generated or set later.
        password: Joi.string().min(8).when('role', { is: 'USER', then: Joi.required(), otherwise: Joi.optional() }),
        passwordConfirm: Joi.string().valid(Joi.ref('password')).when('role', { is: 'USER', then: Joi.required(), otherwise: Joi.optional() }).messages({ 'any.only': 'Passwords must match' }),
        phone: Joi.string().allow('', null),
        // Pincode is required for USER
        pincode: Joi.string().length(6).pattern(/^[0-9]+$/).when('role', { is: 'USER', then: Joi.required(), otherwise: Joi.optional() }),
        recaptchaToken: Joi.string()
    }),
};

const login = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
        recaptchaToken: Joi.string()
    }),
};

module.exports = {
    register,
    login,
};
