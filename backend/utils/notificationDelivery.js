function getRequestedDeliveryErrors(delivery) {
  const errors = [];

  if (
    delivery?.email?.requested &&
    !delivery.email.delivered &&
    delivery.email.error
  ) {
    errors.push(`Email: ${delivery.email.error}`);
  }

  if (delivery?.sms?.requested && !delivery.sms.delivered && delivery.sms.error) {
    errors.push(`SMS: ${delivery.sms.error}`);
  }

  return errors;
}

module.exports = {
  getRequestedDeliveryErrors,
};
