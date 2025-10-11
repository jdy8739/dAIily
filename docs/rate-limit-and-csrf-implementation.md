# Rate Limiting & CSRF Protection Implementation

## Overview

This document describes the implementation of two security features:

1. **Rate Limiting**: Limit story generation to 10 times per day per user
2. **CSRF Protection**: Add CSRF token validation to high-value actions

## 1. Rate Limiting for Story Generation

### Database Changes

Added two fields to the `User` model in `prisma/schema.prisma`:

```prisma
dailyGenerationCount Int      @default(0)
lastGenerationDate   DateTime?
```

### Implementation Strategy

- **Simple Counter Approach**: Track count and date in user table
- **Reset Logic**: Automatically resets count when a new day begins
- **Limit**: Maximum 10 story generations per day
- **User Experience**: Clear error message when limit is reached

### How It Works

1. When user requests story generation, check their `dailyGenerationCount` and `lastGenerationDate`
2. If `lastGenerationDate` is not today, reset count to 0
3. If count >= 10, return `RATE_LIMIT_EXCEEDED` error
4. Otherwise, increment count and proceed with generation

### Files Modified

- `prisma/schema.prisma` - Added rate limit fields
- `features/story/lib/actions.ts` - Added rate limit checking logic
- `features/story/components/story-generator.tsx` - Added user-friendly error messages

### Migration

```bash
npx prisma migrate dev --name add_rate_limit_fields
```

## 2. CSRF Protection for High-Value Actions

### Protected Actions

1. **generateStory** - AI story generation (expensive API calls)
2. **deletePost** - Destructive post deletion
3. **deleteGoal** - Destructive goal deletion

### Implementation Components

#### Server-Side

1. **CSRF Token Generation** (`lib/csrf.ts`)
   - Stateless HMAC-based tokens
   - 1-hour expiry
   - Timing-safe validation

2. **Server Action** (`lib/csrf-client.ts`)
   - `getNewCsrfToken()` - Server action to generate tokens

3. **Validation** (`lib/csrf-middleware.ts`)
   - `validateCsrf()` - Validates tokens in server actions

#### Client-Side

1. **CSRF Provider** (`components/providers/csrf-provider.tsx`)
   - React Context for CSRF token management
   - Auto-refresh every 50 minutes (before 1-hour expiry)
   - `useCsrf()` hook for accessing tokens

2. **Root Layout** (`app/layout.tsx`)
   - CsrfProvider wrapped around entire app

#### Protected Server Actions

Modified to accept and validate CSRF tokens:

- `features/story/lib/actions.ts` - `generateStory(period, csrfToken)`
- `features/feed/lib/actions.ts` - `deletePost(postId, csrfToken)`
- `features/goals/lib/actions.ts` - `deleteGoal(id, csrfToken)`

#### Frontend Components

Updated to pass CSRF tokens:

- `features/story/components/story-generator.tsx`
- `features/feed/components/molecules/delete-post-button.tsx`
- `features/feed/components/molecules/delete-draft-button.tsx`
- `features/goals/components/goals-section.tsx`

### Security Benefits

1. **Prevents CSRF Attacks**: Attackers cannot forge requests without valid tokens
2. **Stateless**: No server-side session storage needed
3. **Auto-Refresh**: Users don't experience token expiration issues
4. **Selective Protection**: Only high-value actions are protected (better UX)

## Error Handling

### Rate Limit Errors

```typescript
if (result.error === "RATE_LIMIT_EXCEEDED") {
  setError(
    "You've reached the daily limit of 10 story generations. Please try again tomorrow."
  );
}
```

### CSRF Errors

```typescript
if (result.error === "Invalid CSRF token") {
  setError("Security token expired. Please refresh the page and try again.");
}
```

## Testing Checklist

### Rate Limiting

- [ ] Generate 10 stories in a day
- [ ] Attempt 11th generation (should fail with rate limit error)
- [ ] Wait until next day, verify count resets
- [ ] Check that error message is user-friendly

### CSRF Protection

- [ ] Story generation works with valid token
- [ ] Post deletion works with valid token
- [ ] Goal deletion works with valid token
- [ ] Actions fail without token or with invalid token
- [ ] Token auto-refreshes after 50 minutes

## Future Enhancements

### Rate Limiting

1. **Premium Tiers**: Different limits for different user types
2. **Analytics**: Track generation patterns
3. **Admin Override**: Allow admins to reset limits
4. **Rate Limit Info**: Show users remaining generations

### CSRF Protection

1. **Extend to More Actions**: Protect other sensitive operations
2. **Token Rotation**: Implement more aggressive token rotation
3. **Monitoring**: Log CSRF validation failures for security analysis
4. **Double-Submit Cookie**: Add additional CSRF protection layer

## Is This Suitable for High Protection?

### Current Implementation: **Medium-High Protection** ✓

**Strengths:**

1. ✅ HMAC-based tokens (cryptographically secure)
2. ✅ Timing-safe comparison (prevents timing attacks)
3. ✅ Token expiry (1-hour window)
4. ✅ Stateless design (scalable)
5. ✅ Selective protection (UX-friendly)
6. ✅ Rate limiting (prevents abuse)

**What Makes It Production-Ready:**

- **CSRF Protection**: Industry-standard HMAC approach
- **Rate Limiting**: Simple but effective counter approach
- **User Experience**: Clear error messages, auto-refresh tokens
- **Performance**: Stateless tokens, minimal database queries

**Limitations (Acceptable for Most Apps):**

1. **Client-Side Storage**: Tokens stored in React state (not persistent)
   - _Impact_: User needs new token on page refresh (negligible impact)
2. **No Request Fingerprinting**: Doesn't validate request origin/IP
   - _Impact_: Could add if needed for stricter security
3. **Rate Limit Per User**: Not per IP or device
   - _Impact_: Multi-account abuse still possible (rare)

### Recommendations for Different Security Levels

#### **Standard Web App** (Current Implementation) ✓

- Current implementation is **excellent**
- Provides strong protection against:
  - CSRF attacks
  - Story generation abuse
  - Unauthorized deletions

#### **Enterprise/Financial App** (Additional Measures)

Would add:

1. Request fingerprinting (IP + User-Agent validation)
2. Double-submit cookie pattern
3. Rate limiting per IP address
4. Audit logging of all protected actions
5. Multi-factor authentication for sensitive operations

#### **High-Security App** (Maximum Protection)

Would add all enterprise measures plus:

1. Hardware security modules (HSM) for token signing
2. Mutual TLS authentication
3. Request signing with client certificates
4. Real-time threat detection
5. Zero-trust architecture

## Conclusion

The current implementation provides **strong, production-ready protection** suitable for most web applications. It balances:

- **Security**: Industry-standard CSRF protection + effective rate limiting
- **Performance**: Stateless, minimal overhead
- **User Experience**: Auto-refresh, clear errors
- **Maintainability**: Simple, well-documented code

For a career development platform like dAIily, this level of protection is **highly suitable and recommended**.
