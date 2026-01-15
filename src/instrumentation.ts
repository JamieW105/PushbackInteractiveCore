
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { getQotdBot, getMgmtBot } = await import('@/lib/bot')
        await getQotdBot()
        await getMgmtBot()
        console.log('[INSTRUMENTATION] Discord bots initialized')
    }
}
