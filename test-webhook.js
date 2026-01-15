// Test Discord Webhook Endpoint
// Run: node test-webhook.js

async function testEndpoint() {
    const url = 'http://localhost:3000/api/discord/interactions';

    // Discord sends a PING (type 1) to verify the endpoint
    const pingPayload = {
        type: 1,
        id: 'test',
        application_id: 'test'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // These headers would normally be set by Discord
                'x-signature-ed25519': 'test',
                'x-signature-timestamp': Date.now().toString()
            },
            body: JSON.stringify(pingPayload)
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);

        if (response.status === 401) {
            console.log('\n❌ Signature verification failed (expected for local test)');
            console.log('This is normal - Discord will use real signatures.');
            console.log('Make sure DISCORD_PUBLIC_KEY is set in your .env.local');
        } else if (data.type === 1) {
            console.log('\n✅ Endpoint is working! It responded to PING correctly.');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\nMake sure your dev server is running: npm run dev');
    }
}

testEndpoint();
