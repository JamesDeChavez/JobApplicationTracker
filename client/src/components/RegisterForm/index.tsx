import { useState, useEffect, useContext } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import axios from 'axios'
import './styles.css'
import { UserLoggedInContext } from '../../App'

interface Props {
    setForm: React.Dispatch<React.SetStateAction<string>>
}

const RegisterForm: React.FC<Props> = ({setForm}) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [repeatPW, setRepeatPW] = useState('')
    const [errorMessage, setErrorMessage] = useState<string | undefined>()
    const { setUserLoggedIn, setUserId } = useContext(UserLoggedInContext) 

    useEffect(() => {
        setErrorMessage(undefined)
    }, [username, password, repeatPW])

    const handleLoginClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setForm('LOGIN')
    }

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!username || !password || !repeatPW) {
            setErrorMessage('Please fill out all fields')
            return
        }
        if (password !== repeatPW) {
            setErrorMessage('Passwords do not match')
            return
        }
        try {
            const res = await axios.post('https://jobapplicationtracker-7m4l.onrender.com/api/create_user', {
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

    const className = 'RegisterForm'
    return (
        <Form className={`w-50 mx-auto mt-5 ${className}`} onSubmit={handleFormSubmit}>
            <h2 className='text-center'>Register</h2>
            <Form.Group className="mb-3" controlId="registerFormUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="registerFormPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="registerFormRepeatPW">
                <Form.Label>Repeat Password</Form.Label>
                <Form.Control type="password" placeholder="Repeat Password" value={repeatPW} onChange={(e) => setRepeatPW(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit">
                Submit
            </Button>
            <Form.Group className="mb-3 mt-3" controlId="registerFormError" style={{display: errorMessage ? 'block' : 'none'}}>
                <Form.Text style={{color: 'red'}}>
                    {errorMessage}
                </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3 mt-3" controlId="registerFormPassword">
                <Form.Text>
                    Already have an account? <button className={`${className}_loginButton`} onClick={handleLoginClick} >Login</button>
                </Form.Text>
            </Form.Group>
        </Form>
    )
}

export default RegisterForm