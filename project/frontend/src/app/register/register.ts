import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { Title } from '@angular/platform-browser';


@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        MatInputModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatButtonModule,
        MatCardModule,
        MatSnackBarModule
    ],
    templateUrl: './register.html',
    styleUrls: ['./register.css']
})


export class RegisterComponent implements OnInit {
    submitted = false;

    constructor(
        private snackBar: MatSnackBar,
        private http: HttpClient,
        private titleService: Title
    ) {}


    ngOnInit(): void {
        this.titleService.setTitle('Stuff & Things - Regisztráció');
    }


    onRegister(form: NgForm) {
        this.submitted = true;
        const val = form.value;

        if (!form.valid) {
            this.showError('Hibás adatok!');
            return;
        }

        if (val.password !== val.password2) {
            this.showError('A megadott jelszavak nem egyeznek meg.');
            return;
        }

        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordPattern.test(val.password)) {
            this.showError(
                'A jelszónak tartalmaznia kell kis- és nagybetűt, számot, speciális karaktert, és legalább 8 karakter hosszúnak kell lennie.'
            );
            return;
        }

        const user = {
            username: val.username,
            email: val.email,
            password: val.password,
            createdAt: new Date()
        };

        this.http.post('http://localhost:3000/api/register', user).subscribe({
            next: () => {
                this.snackBar.open('Sikeres regisztráció!', 'Bezár', {
                    duration: 3000,
                    verticalPosition: 'top',
                    horizontalPosition: 'center',
                });
                form.resetForm();
                this.submitted = false;
            },
            error: (err) => {
                if (err.status === 409 && err.error && err.error.message) {
                    this.showError(err.error.message);
                } else {
                    this.showError('Hiba a regisztráció során. Próbáld újra később.');
                }
                console.error(err);
            }
        });
    }

    
    private showError(message: string) {
        this.snackBar.open(message, 'Bezár', {
            duration: 5000,
            panelClass: ['error-snackbar'],
            verticalPosition: 'top',
            horizontalPosition: 'center',
        });
    }
}
