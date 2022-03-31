import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@auth/services/auth.services';
import { ACTIONS } from '@shared/constants/constants';
import { ApiError, User, UserCredentials } from '@supabase/supabase-js';
import { ToastrService } from 'ngx-toastr';


export interface OptionsForm{ //<= El contrato para los componentes que quieran utilizar el formulario
  id: string;
  label: string;
}

interface UserResponse extends User, ApiError{}
@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  authForm!: FormGroup;

  SignIn = ACTIONS.signIn;

  @Input() options!: OptionsForm;

  constructor(
    private readonly authSvc: AuthService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly toastSvc: ToastrService
    ) { }

  ngOnInit(): void {
    this.initForm();
  }

  async onSubmit():Promise<void>{
    console.log("Save", this.authForm.value);
    //this.authSvc.signUp(this.authForm.value);
    const credentials: UserCredentials = this.authForm.value;
    let actionToCall;
    if(this.options.id === this.SignIn){
      actionToCall = this.authSvc.signIn(credentials);
    } else {
      actionToCall = this.authSvc.signUp(credentials);
    }
    try {
     const result = await actionToCall as UserResponse;
     if(result.email){
       this.redirectUser();
      // console.log('home ->');
     } else {
       //TODO: Mostrar notificación
       this.toastSvc.info(result.message, 'Info');
       console.log('notification ->');
     }
    } catch (error) {
      console.log("error de credenciales ", error);
    }

  }

  private initForm():void{
    this.authForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  private redirectUser():void{
    this.router.navigate(['/home']);
  }
}
