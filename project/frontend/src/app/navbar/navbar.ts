import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';


@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        HttpClientModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatDividerModule,
        MatSnackBarModule
    ],
    templateUrl: './navbar.html',
    styleUrls: ['./navbar.css']
})


export class Navbar implements OnInit {
    loginData = {
        username: '',
        password: '',
        remember: false
    };

    username$!: Observable<string | null>;
    isLoggedIn$!: Observable<boolean>;
    mobileMenuOpen = false;


    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private snackBar: MatSnackBar
    ) {}


    ngOnInit(): void {
        this.username$ = this.authService.username$;
        this.isLoggedIn$ = this.authService.isLoggedIn$;

        if (window.innerWidth > 768) {
            this.mobileMenuOpen = false;
        }
    }


    @HostListener('window:resize', [])
    onWindowResize() {
        if (window.innerWidth > 768 && this.mobileMenuOpen) {
            this.closeMobileMenu();
        }
    }


    onLogin(event: Event) {
        event.preventDefault();
        if (!this.loginData.username || !this.loginData.password) {
            this.snackBar.open('Hiányzó adatok!', 'Bezár', {
                duration: 3000,
                panelClass: ['snackbar-warning'],
                verticalPosition: 'top',
                horizontalPosition: 'center'
            });
            return;
        }

        this.http.post<{ username: string, message: string }>('http://localhost:3000/api/login', {
            username: this.loginData.username,
            password: this.loginData.password
        }).subscribe({
            next: (response) => {
                this.authService.login(response.username);
                this.snackBar.open('Sikeres bejelentkezés!', 'Bezár', {
                    duration: 3000,
                    panelClass: ['snackbar-success'],
                    verticalPosition: 'top',
                    horizontalPosition: 'center'
                });
                this.loginData = { username: '', password: '', remember: false };
            },
            error: (err) => {
                this.snackBar.open(err.error.message || 'Hibás bejelentkezés!', 'Bezár', {
                    duration: 3000,
                    panelClass: ['snackbar-error'],
                    verticalPosition: 'top',
                    horizontalPosition: 'center'
                });
            }
        });
    }


    logout() {
        this.authService.logout();
        this.snackBar.open('Sikeres kijelentkezés!', 'Bezár', {
            duration: 3000,
            panelClass: ['snackbar-info'],
            verticalPosition: 'top',
            horizontalPosition: 'center'
        });
    }


    onMenuClosed() {
        this.loginData = {
            username: '',
            password: '',
            remember: false
        };
    }


    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }


    closeMobileMenu() {
        this.mobileMenuOpen = false;
    }
}
