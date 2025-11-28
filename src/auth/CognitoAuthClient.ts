import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserSession } from 'amazon-cognito-identity-js';

/**
 * AWS Cognito Authentication Client for React
 * 
 * Provides SRP authentication and token management
 */
class CognitoAuthClient {
    private userPool: CognitoUserPool;
    private region: string;
    private currentSession: CognitoUserSession | null = null;
    private currentTokens: {
        accessToken: string;
        idToken: string;
        refreshToken: string;
    } | null = null;
    private currentUser: CognitoUser | null = null;

    constructor(userPoolId: string, clientId: string, region: string = 'us-east-1') {
        const poolData = {
            UserPoolId: userPoolId,
            ClientId: clientId,
        };

        this.userPool = new CognitoUserPool(poolData);
        this.region = region;
    }

    /**
     * Authenticate user using SRP (Secure Remote Password)
     * TEMPORARILY BYPASSED - Always returns success
     */
    login(username: string, password: string): Promise<{
        accessToken: string;
        idToken: string;
        refreshToken: string;
        userPoolId: string;
        clientId: string;
        session: CognitoUserSession;
        user: CognitoUser;
    }> {
        // BYPASS COGNITO AUTHENTICATION FOR NOW - Always return success
        // Create mock tokens and session
        const mockAccessToken = `mock-access-token-${Date.now()}`;
        const mockIdToken = `mock-id-token-${Date.now()}`;
        const mockRefreshToken = `mock-refresh-token-${Date.now()}`;

        this.currentTokens = {
            accessToken: mockAccessToken,
            idToken: mockIdToken,
            refreshToken: mockRefreshToken,
        };

        // Create a mock user object
        const cognitoUser = new CognitoUser({
            Username: username,
            Pool: this.userPool,
        });
        this.currentUser = cognitoUser;

        // Return mock success response
        return Promise.resolve({
            accessToken: mockAccessToken,
            idToken: mockIdToken,
            refreshToken: mockRefreshToken,
            userPoolId: this.userPool.getUserPoolId(),
            clientId: this.userPool.getClientId(),
            session: null as any, // Mock session
            user: cognitoUser,
        });

        // ORIGINAL COGNITO AUTHENTICATION CODE - COMMENTED OUT
        /*
        const authenticationDetails = new AuthenticationDetails({
            Username: username,
            Password: password,
        });

        const cognitoUser = new CognitoUser({
            Username: username,
            Pool: this.userPool,
        });

        this.currentUser = cognitoUser;

        return new Promise((resolve, reject) => {
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (session) => {
                    // Store session and tokens
                    this.currentSession = session;
                    this.currentTokens = {
                        accessToken: session.getAccessToken().getJwtToken(),
                        idToken: session.getIdToken().getJwtToken(),
                        refreshToken: session.getRefreshToken().getToken(),
                    };

                    resolve({
                        accessToken: this.currentTokens.accessToken,
                        idToken: this.currentTokens.idToken,
                        refreshToken: this.currentTokens.refreshToken,
                        userPoolId: this.userPool.getUserPoolId(),
                        clientId: this.userPool.getClientId(),
                        session: this.currentSession,
                        user: cognitoUser,
                    });
                },
                onFailure: (err) => {
                    reject(err);
                },
            });
        });
        */
    }

    /**
     * Get current session from storage or check if valid
     * TEMPORARILY BYPASSED - Returns mock session if tokens exist
     */
    async getCurrentSession(): Promise<CognitoUserSession | null> {
        // BYPASS SESSION VALIDATION FOR NOW - Return mock session if tokens exist
        if (this.currentTokens) {
            return Promise.resolve(null as any); // Return mock session
        }
        return Promise.resolve(null);

        // ORIGINAL SESSION CHECK CODE - COMMENTED OUT
        /*
        return new Promise((resolve) => {
            const cognitoUser = this.userPool.getCurrentUser();
            
            if (!cognitoUser) {
                resolve(null);
                return;
            }

            cognitoUser.getSession((err, session) => {
                if (err || !session.isValid()) {
                    resolve(null);
                    return;
                }

                this.currentSession = session;
                this.currentUser = cognitoUser;
                this.currentTokens = {
                    accessToken: session.getAccessToken().getJwtToken(),
                    idToken: session.getIdToken().getJwtToken(),
                    refreshToken: session.getRefreshToken().getToken(),
                };

                resolve(session);
            });
        });
        */
    }

    /**
     * Get user attributes from current session
     * TEMPORARILY BYPASSED - Returns mock user attributes
     */
    async getUserAttributes(): Promise<Record<string, string>> {
        // BYPASS FOR NOW - Return mock attributes
        if (this.currentUser) {
            const username = (this.currentUser as any).username || 'user';
            return Promise.resolve({
                email: username,
                'cognito:username': username,
            });
        }
        return Promise.resolve({
            email: 'user@example.com',
            'cognito:username': 'user',
        });

        // ORIGINAL CODE - COMMENTED OUT
        /*
        return new Promise((resolve, reject) => {
            if (!this.currentUser) {
                reject(new Error('No user session'));
                return;
            }

            this.currentUser.getUserAttributes((err, attributes) => {
                if (err) {
                    reject(err);
                    return;
                }

                const userAttributes: Record<string, string> = {};
                if (attributes) {
                    attributes.forEach((attr) => {
                        userAttributes[attr.Name] = attr.Value;
                    });
                }

                resolve(userAttributes);
            });
        });
        */
    }

    /**
     * Logout current user
     */
    logout(): Promise<void> {
        return new Promise((resolve) => {
            if (this.currentUser) {
                this.currentUser.signOut(() => {
                    this.currentSession = null;
                    this.currentTokens = null;
                    this.currentUser = null;
                    resolve();
                });
            } else {
                this.currentSession = null;
                this.currentTokens = null;
                resolve();
            }
        });
    }

    /**
     * Get current authentication status
     */
    isAuthenticated(): boolean {
        return !!(this.currentSession && this.currentTokens);
    }

    /**
     * Get current tokens (if authenticated)
     */
    getTokens(): { accessToken: string; idToken: string; refreshToken: string } | null {
        return this.currentTokens;
    }

    /**
     * Get ID token for API calls
     */
    getIdToken(): string | null {
        return this.currentTokens?.idToken || null;
    }

    /**
     * Refresh the session
     */
    async refreshSession(): Promise<CognitoUserSession> {
        return new Promise((resolve, reject) => {
            if (!this.currentUser) {
                reject(new Error('No user session'));
                return;
            }

            this.currentUser.getSession((err, session) => {
                if (err) {
                    reject(err);
                    return;
                }

                session.refresh({
                    refreshToken: session.getRefreshToken(),
                }, (refreshErr, refreshedSession) => {
                    if (refreshErr) {
                        reject(refreshErr);
                        return;
                    }

                    this.currentSession = refreshedSession;
                    this.currentTokens = {
                        accessToken: refreshedSession.getAccessToken().getJwtToken(),
                        idToken: refreshedSession.getIdToken().getJwtToken(),
                        refreshToken: refreshedSession.getRefreshToken().getToken(),
                    };

                    resolve(refreshedSession);
                });
            });
        });
    }
}

export default CognitoAuthClient;

