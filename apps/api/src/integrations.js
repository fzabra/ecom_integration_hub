async function sendWebhooks(payload) {
  const targets = (process.env.WEBHOOK_TARGETS || '')
    .split(',')
    .map((target) => target.trim())
    .filter(Boolean);

  if (targets.length === 0) {
    return;
  }

  await Promise.allSettled(
    targets.map(async (target) => {
      await fetch(target, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    })
  );
}

function mockSaaSCharge(order) {
  return {
    provider: 'stripe-mock',
    chargeId: `ch_mock_${order.id}`,
    amount_cents: order.total_cents,
    status: 'succeeded'
  };
}

module.exports = {
  sendWebhooks,
  mockSaaSCharge
};
