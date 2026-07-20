const isProduction = process.env.NODE_ENV === 'production';

export const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 30,
    // Enable partitioned cookies (CHIPS) for browsers that support it.
    // This helps with Safari's ITP and Chrome's third-party cookie phaseout.
    ...(isProduction ? { partitioned: true } : {}),
};
