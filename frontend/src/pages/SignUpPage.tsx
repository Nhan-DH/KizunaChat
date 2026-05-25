import { SignupForm } from '@/components/auth/signup-form'
import React from 'react'

const SignUpPage = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-4xl">
                <SignupForm />
            </div>
        </div>
    )
}

export default SignUpPage