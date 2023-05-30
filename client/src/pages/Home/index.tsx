import { useState } from 'react'
import LoginForm from '../../components/LoginForm'
import RegisterForm from '../../components/RegisterForm'

const Home = () => {
    const FORMS = ['LOGIN', 'REGISTER']
    const [form, setForm] = useState(FORMS[0])
    return (
        <div className="container py-4 px-3 mx-auto">
            <h1 className='text-center' >Job Application Tracker</h1>
            {{
                [FORMS[0]]: <LoginForm setForm={setForm} />,
                [FORMS[1]]: <RegisterForm setForm={setForm} />,
            }[form]}
        </div>
    )
}

export default Home