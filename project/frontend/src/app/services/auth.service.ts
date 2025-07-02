import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AuthService {
    private usernameSubject = new BehaviorSubject<string | null>(localStorage.getItem('username'));
    username$ = this.usernameSubject.asObservable();

    private isLoggedInSubject = new BehaviorSubject<boolean>(localStorage.getItem('isLoggedIn') === 'true');
    isLoggedIn$ = this.isLoggedInSubject.asObservable();


    login(username: string) {
        this.usernameSubject.next(username);
        this.isLoggedInSubject.next(true);
        localStorage.setItem('username', username);
        localStorage.setItem('isLoggedIn', 'true');
    }

    
    logout() {
        this.usernameSubject.next(null);
        this.isLoggedInSubject.next(false);
        localStorage.removeItem('username');
        localStorage.removeItem('isLoggedIn');
    }
}
