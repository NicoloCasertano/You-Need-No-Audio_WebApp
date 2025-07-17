import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/authorization-service';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-log-in-area',
    standalone: true,
    imports: [ReactiveFormsModule, RouterModule],
    templateUrl: './log-in-area.html',
    styleUrl: './log-in-area.css'
})
export class LogInArea {
    formBuilder = inject(FormBuilder);
    private _authService = inject(AuthService);
    private _router = inject(Router);

    loginForm: FormGroup = this.formBuilder.group({
        email:["", [Validators.required]],
        password:["", [Validators.required]]
    });
    
    onSubmit() {
        if(this.loginForm.invalid) return;
        
        this._authService.login(this.loginForm.value).subscribe({
            next:(response) => {
                this._authService.setToken(response.token);
                localStorage.setItem('jwt_token', response.token);
                const userId = this._authService.getUserId();
                console.log('ID ricavato dopo il login: ', userId);

                if(userId) {
                    this._router.navigate(['/user', userId]);
                    console.log(this._authService.getUserRoles());
                    console.log('Login token:', response.token);
                } else {
                    console.error('Impossibile ricavare userId dal token');
                }
            },
            error: (err: any) => {
                console.log('Errore durante il login: ', err);
            }  
        });
    }

    gotToSignIn() {
        this._router.navigate(['/register-area']);
    }
    
}
