import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/authorization-service';
import { Token } from '@angular/compiler';
import { JwtTokenModel } from '../../models/jwt-token-model';


@Component({
    selector: 'app-register-area',
    imports: [ReactiveFormsModule, RouterModule],
    templateUrl: './register-area.html',
    styleUrl: './register-area.css'
})
export class RegisterAreaComponent {
    formBuilder = inject(FormBuilder);
    registerForm: FormGroup;
    private _authService = inject(AuthService);
    private _router = inject(Router)

    constructor() {
        this.registerForm = this.formBuilder.group({
            name:["",[Validators.required]],
            email: ["", [Validators.required]],
            password: ["", [Validators.required]]
        })
    }

    onSubmit(){
        if(this.registerForm.invalid) return;

        this._authService.register(this.registerForm.value).subscribe({
            next: (authToken: JwtTokenModel) => {
                console.log('Token ricevuto: ', authToken.token);
                this._authService.setToken(authToken.token);
                this._router.navigate(['/home']);
            },
            error: e => {
                console.error('Errore nella registrazione: ', e);
                alert('Registrazione fallita');
            }
        });
    }

    goToLogIn() {
        this._router.navigate(['/log-in-area']);
    }
}

