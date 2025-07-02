import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';


interface ProductData {
    name: string;
    brand: string;
    category: string;
    price: number;
    description: string;
}


@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatSnackBarModule,
    ],
    templateUrl: './product-form.html',
    styleUrls: ['./product-form.css']
})


export class ProductForm {
    form: ProductData = {
        name: '',
        brand: '',
        category: '',
        price: 0,
        description: ''
    };

    isEditMode: boolean = false;

    private authSubscription!: Subscription; 

    constructor(
        public dialogRef: MatDialogRef<ProductForm>,
        @Inject(MAT_DIALOG_DATA) public data: ProductData | null,
        private snackBar: MatSnackBar,
        private authService: AuthService
    ) {
        if (data && data.name && data.name.trim().length > 0) {
            this.form = { ...data };
            this.isEditMode = true;
        } else {
            this.form = {
                name: '',
                brand: '',
                category: '',
                price: 0,
                description: ''
            };
            this.isEditMode = false;
        }

        this.authSubscription = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
            if (!isLoggedIn) {
                this.dialogRef.close();
            }
        });
    }


    ngOnDestroy(): void {
        this.authSubscription.unsubscribe();
    }

    
    save(): void {
        let errorMessage = '';

        if (!/[a-zA-Z]/.test(this.form.name)) {
            errorMessage = 'A névnek legalább egy betűt tartalmaznia kell!';
        } else if (!this.form.brand || this.form.brand.trim().length === 0) {
            errorMessage = 'A márka megadása kötelező!';
        } else if (!this.form.category || this.form.category.trim().length === 0) {
            errorMessage = 'A kategória megadása kötelező!';
        } else if (this.form.price === null || this.form.price <= 0) {
            errorMessage = 'Az árnak pozitív számnak kell lennie!';
        } else if (this.form.description && this.form.description.length > 100) {
            errorMessage = 'A leírás maximum 100 karakter lehet!';
        }

        if (errorMessage) {
            this.snackBar.open(errorMessage, 'Bezár', {
                duration: 4000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
            });
            return;
        }

        this.dialogRef.close(this.form);

        this.snackBar.open(
            this.isEditMode ? 'Termék módosítva!' : 'Új termék hozzáadva!',
            'Bezár',
            {
                duration: 3000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
            }
        );
    }


    cancel(): void {
        this.dialogRef.close(null);
    }
}
