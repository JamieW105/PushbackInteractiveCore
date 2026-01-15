
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { getQotdBot, getMgmtBot } = await import('@/lib/bot')
        getQotdBot()
        getMgmtBot()
    }
}
