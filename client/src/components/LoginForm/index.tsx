import { useState, useEffect, useContext } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import './styles.css'
import { UserLoggedInContext } from '../../App'
import axios from 'axios'

interface Props {
    setForm: React.Dispatch<React.SetStateAction<string>>
}

const LoginForm: React.FC<Props> = ({setForm}) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState<string | undefined>()
    const { setUserLoggedIn, setUserId } = useContext(UserLoggedInContext) 

    useEffect(() => {
        setErrorMessage(undefined)
    }, [username, password])

    const handleRegisterClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setForm('REGISTER')
    }

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!username || !password ) {
            setErrorMessage('Please fill out all fields')
            return
        }
        try {
            const res = await axios.post('https://jobapplicationtracker-7m4l.onrender.com/api/get_user/login', {
                username,
                password
            })
            const data = res.data
            if (data) {
                const token = data.token
                localStorage.setItem('token', token)
                setUserLoggedIn(true)
                setUserId(data.user.id)
            } else {
                console.log('error', data)
            }
        } catch (error) {
            console.log(error)
            return
        }
    }

    const className = 'LoginForm'
    return (
        <Form className={`w-50 mx-auto mt-5 ${className}`} onSubmit={handleFormSubmit}>
            <h2 className='text-center'>Login</h2>
            <Form.Group className="mb-3" controlId="loginFormUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="loginFormPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit">
                Submit
            </Button>
            <Form.Group className="mb-3 mt-3" controlId="loginFormError" style={{display: errorMessage ? 'block' : 'none'}}>
                <Form.Text style={{color: 'red'}}>
                    {errorMessage}
                </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3 mt-3" controlId="loginFormPassword">
                <Form.Text>
                    No Account? <button className={`${className}_registerButton`} onClick={handleRegisterClick} >Register</button>
                </Form.Text>
            </Form.Group>
        </Form>
    )
}

export default LoginForm