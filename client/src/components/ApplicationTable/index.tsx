import { useContext, useEffect, useState } from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Dropdown from 'react-bootstrap/Dropdown'
import Button from 'react-bootstrap/Button'
import { UserLoggedInContext } from '../../App'
import axios from 'axios'

interface Application {
    company: string,
    id: number,
    position: string,
    status: string,
    url: string,
    userid: string
}

const ApplicationTable = () => {
    const [applications, setApplications] = useState<Application[]>([])
    const { userId } = useContext(UserLoggedInContext)
    const STAUS_OPTIONS = ['Open', 'In Progress', 'Closed']

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await axios.get(`https://jobapplicationtracker-7m4l.onrender.com/api/get_apps/${userId}`)
                const data = res.data
                if (data) {
                    console.log(data.applications)
                    setApplications(data.applications)
                } else {
                    console.log('No data')
                }
                return
            } catch (error) {
                console.log(error)
                return
            }
        }
        fetchApplications()
    }, [])

    const handleStatusChange = async (e: React.MouseEvent<HTMLElement, MouseEvent>, i: number) => {
        e.preventDefault()
        const status = e.currentTarget.innerText
        let newApplications = [...applications]
        newApplications[i].status = status
        setApplications(newApplications)
        try {
            const res = await axios.put(`https://jobapplicationtracker-7m4l.onrender.com/api/update_app/`, {
                id: applications[i].id,
                status: status
            })
            const data = res.data
            if (data) {
                console.log(data)
            } else {
                console.log('No data')
            }
        } catch (error) {
            console.log(error)
            return    
        }
        return
    }

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, i: number) => {
        e.preventDefault()
        const appId = applications[i].id
        let newApplications = [...applications]
        newApplications.splice(i, 1)
        setApplications(newApplications)
        try {
            const res = await axios.delete(`https://jobapplicationtracker-7m4l.onrender.com/api/delete_app/${appId}`)
            const data = res.data
            if (data) {
                console.log(data)
            } else {
                console.log('No data')
                return
            }
            return
        } catch (error) {
          console.log(error)
          return  
        }
    }

    return (<>    
        <Container className="mt-4">
            <Row>
                <Col className="text-center border border-dark bg-primary text-light">Company</Col>
                <Col className="text-center border border-dark bg-primary text-light">Position</Col>
                <Col className="text-center border border-dark bg-primary text-light">URL</Col>
                <Col className="text-center border border-dark bg-primary text-light">Status</Col>
                <Col className="text-center border border-dark bg-primary text-light">Delete</Col>
            </Row>
        </Container>
        {applications.map((application: any, i: number) => {
            return (
                <Container className="mt-1">
                    <Row>
                        <Col className="text-center border border-dark bg-light">{application.company}</Col>
                        <Col className="text-center border border-dark bg-light">{application.position}</Col>
                        <Col className="text-center border border-dark bg-light">{application.url}</Col>
                        <Col className="text-center border border-dark bg-light">
                            <Dropdown>
                                <Dropdown.Toggle id="dropdown-basic" style={{ backgroundColor: 'transparent', border: 'none', color:  'black'}} >
                                    {application.status}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {STAUS_OPTIONS.filter(status => status !== application.status).map((status, idx) => {
                                        return (
                                            <Dropdown.Item key={idx} onClick={(e) => handleStatusChange(e, i)}>{status}</Dropdown.Item>
                                        )
                                    })

                                    }
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                        <Col className="text-center">
                            <Button variant="danger" onClick={(e) => handleDelete(e, i)}>Delete</Button>
                        </Col>
                    </Row>
                </Container>
            )
        
        })

        }
    </>)
}

export default ApplicationTable