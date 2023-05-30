import { useState, useEffect, useContext } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import axios from 'axios'
import { UserLoggedInContext } from '../../App'
import './styles.css'

interface Props {
    setFormActive: React.Dispatch<React.SetStateAction<boolean>>
}

const NewAppForm: React.FC<Props> = ({setFormActive}) => {
    const [company, setCompany] = useState('')
    const [position, setPosition] = useState('')
    const [url, setUrl] = useState('')
    const [errorMessage, setErrorMessage] = useState<string | undefined>()
    const { userId } = useContext(UserLoggedInContext) 


    useEffect(() => {
        setErrorMessage(undefined)
    }, [company, position, url])

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!company || !position || !url) {
            setErrorMessage('Please fill out all fields')
            return
        }
        try {
            const res = await axios.post('https://jobapplicationtracker-7m4l.onrender.com/api/create_app', {
                company,
                position,
                url,
                status: 'Open',
                userid: userId.toString()
            })
            const data = res.data
            if (data) {
                console.log('success', data)
                setCompany('')
                setPosition('')
                setUrl('')
                setErrorMessage(undefined)
                setFormActive(false)
                return;
            } else {
                console.log('error', data)
            }
        } catch (error) {
            console.log(error)
            return
        }
    }

    const className = 'NewAppForm'
    return (
        <Form className={`w-50 mx-auto mt-5 ${className}`} onSubmit={handleFormSubmit}>
            <h2 className='text-center'>New Job Application</h2>
            <Form.Group className="mb-3" controlId="newAppCompany">
                <Form.Label>Company</Form.Label>
                <Form.Control type="text" placeholder="Enter Company Name" value={company} onChange={e => setCompany(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="newAppPosition">
                <Form.Label>Position</Form.Label>
                <Form.Control type="text" placeholder="Enter Position Title" value={position} onChange={e => setPosition(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="newAppUrl">
                <Form.Label>URL</Form.Label>
                <Form.Control type="text" placeholder="Enter Job URL" value={url} onChange={e => setUrl(e.target.value)} />
            </Form.Group>

            <Button variant="primary" type="submit">
                Submit
            </Button>

            <Form.Group className="mb-3 mt-3" controlId="newAppError" style={{display: errorMessage ? 'block' : 'none'}}>
                <Form.Text style={{color: 'red'}}>
                    {errorMessage}
                </Form.Text>
            </Form.Group>
        </Form>
    )
}

export default NewAppForm