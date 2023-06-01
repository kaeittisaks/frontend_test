
import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Stack, Typography } from '@mui/material';
// components
// mock
import React, { useState, useEffect} from 'react';
import { Link,useLocation } from 'react-router-dom';

import html2pdf from 'html2pdf.js';
import { PDFViewer, Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


// search
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

// มีเเล้ว
import { makeStyles } from '@mui/styles';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';

import EditorToolbar, { modules, formats } from "./EditorToolbar";

const emailList = [
  { id: 1, email: 'example1@example.com' },
  { id: 2, email: 'example2@example.com' },
  { id: 3, email: 'example3@example.com' },
  { id: 4, email: 'example4@example.com' },
];


export default function BlogPage() {

  const location = useLocation();
  const [content, setContent] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const encodedContent = searchParams.get('content');
    if (encodedContent) {
      const decodedContent = decodeURIComponent(encodedContent);
      setContent(decodedContent);
    }
  }, [location.search]);

  const handleCopyLink = async () => {
    const link = window.location.href;
    const accessPermission = prompt('Enter access permission (public or private):');
  
    if (accessPermission === 'public') {
      try {
        const shortenedLink = await createShortenedLink(link, 'public');
        copyToClipboard(shortenedLink);
        alert('Public link copied to clipboard!');
      } catch (error) {
        console.error('Failed to create and copy public link:', error);
        alert('Failed to create and copy public link. Please try again.');
      }
    } else if (accessPermission === 'private') {
      const user = prompt('Enter username:');
      const password = prompt('Enter password:');
  
      if (user && password) {
        try {
          const credentials = btoa(`${user}:${password}`);
          const shortenedLink = await createShortenedLink(link, 'private', credentials);
          copyToClipboard(shortenedLink);
          alert('Private link copied to clipboard!');
        } catch (error) {
          console.error('Failed to create and copy private link:', error);
          alert('Failed to create and copy private link. Please try again.');
        }
      } else {
        alert('Invalid username or password!');
      }
    } else {
      alert('Invalid access permission!');
    }
  };
  

  const createShortenedLink = async (originalLink, accessPermission, credentials) => {
    const response = await fetch('http://localhost:5173/create', {
      method: 'POST',
      body: JSON.stringify({
        originalLink,
        accessPermission,
        credentials,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    if (response.ok) {
      const data = await response.json();
      return data.shortenedLink;
    }
  
    return null; // เพิ่มคำสั่งนี้สำหรับการส่งคืนค่าเริ่มต้นในกรณีที่เงื่อนไขไม่เป็นจริง
  };
  
  

  const copyToClipboard = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  const handleContentChange = (value) => {
    setContent(value);
    setPreviewContent(value); // Update the preview content as well
  };

  const generatePdf = () => {
    const htmlContent = `<html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        <div>${content}</div>
      </body>
    </html>`;

    html2pdf()
      .set({ html2canvas: { scale: 2 } })
      .from(htmlContent)
      .save('document.pdf');
  };

  const styles = StyleSheet.create({
    page: {
      flexDirection: 'row',
      backgroundColor: '#ffffff',
      margin: 0,
      paddingTop: 20,
      paddingRight: 20,
      paddingBottom: 20,
      paddingLeft: 20,
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1,
    },
    content: {
      fontSize: 12,
      whiteSpace: 'pre-wrap',
    },
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setPdfFile(file);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (pdfFile) {
        const fileData = await readFileData(pdfFile);
        setContent(fileData);
      }
    };

    fetchData();
  }, [pdfFile]);

  const readFileData = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = event.target.result;
        resolve(fileData);
      };
      reader.onerror = (event) => {
        reject(event);
      };
      reader.readAsText(file);
    });
  };


// search
const [data, setData] = useState([]);
const [selectedData, setSelectedData] = useState(null);
const [searchTerm, setSearchTerm] = useState('');
const [quillValue, setQuillValue] = useState('');

useEffect(() => {
  fetchData();
}, []);

const fetchData = () => {
  fetch('https://fragile-boa-kilt.cyclic.app/data')
    .then((res) => res.json())
    .then((data) => setData(data))
    .catch((err) => console.log(err));
};

const handleDataClick = (id) => {
  fetch(`https://fragile-boa-kilt.cyclic.app/data/${id}`)
    .then((res) => res.json())
    .then((data) => setSelectedData(data[0]))
    .catch((err) => console.log(err));
};

const handleSearch = () => {
  fetch(`https://fragile-boa-kilt.cyclic.app/search?search=${searchTerm}`)
    .then((response) => response.json())
    .then((data) => {
      setData(data);
      setSelectedData(null);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};

const handleDragStart = (event, menu) => {
  event.dataTransfer.setData('text/plain', menu.name);
};

const handleDragOver = (event) => {
  event.preventDefault();
};

const handleDrop = (event) => {
  event.preventDefault();
  const draggedMenuName = event.dataTransfer.getData('text/plain');
  setQuillValue(quillValue + draggedMenuName);
};

const handleListItemClick = (fullNameThai) => {
  setQuillValue(quillValue + fullNameThai);
};

const handleQuillChange = (value) => {
  setQuillValue(value);
};
// search



const [previewContent, setPreviewContent] = useState('');
const [isPreviewOpen, setIsPreviewOpen] = useState(false);

const useStyles = makeStyles(() => ({
  dialogContainer: {
    width: '50vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  a4Paper: {
    width: '8.27in',
    height: '11.69in',
    margin: 'auto',
    padding: '20px',
    border: '1px solid #ccc',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    lineHeight: '1.2',
    fontSize: '12px',
  },
}));

const PreviewPopup = ({ content, onClose }) => {
  const classes = useStyles();

  return (
    <Dialog open onClose={onClose} maxWidth={false}>
    <DialogContent className={classes.dialogContainer}>
      <div className={classes.a4Paper}>
        <Button onClick={onClose} sx={{ position: 'absolute', right: 10, top: 10 }}>
          X
        </Button>
        <DialogContentText
          style={{ lineHeight: '1.2', margin: '0' }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </DialogContent>
  </Dialog>
  );
};

  const closePreview = () => {
    setIsPreviewOpen(false);
  };
  

const [selectedEmail, setSelectedEmail] = useState('');
const [filteredEmails, setFilteredEmails] = useState([]);

const handleSearchTermChange = (event) => {
  const term = event.target.value;
  setSearchTerm(term);

  const filteredEmails = emailList.filter((email) =>
    email.email.toLowerCase().includes(term.toLowerCase())
  );
  setFilteredEmails(filteredEmails);
};

const handleEmailSelect = (email) => {
  setSelectedEmail(email);
};


  return (
    <>
      <Helmet>
        <title> Dashboard: Blog | Minimal UI </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
          <div className="top-nav clip-contents">
      <div className="group-1068">
       <Link to="/Document"> <div className="main-page-1">
        
          <p className="main-page">Main page</p>
        </div></Link>
        
        <div  className="box-import-file">
         
          <img
            src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/2pekb39nnrn-241%3A522?alt=media&token=4a7e529e-07d6-418c-b618-f2fb88e9190a"
            alt="Not Found"
            className="frame-64"
          />
          <div className="frame-63">
            <div className="frame-62">

             {/* import file */}
            <input className="custom-file-input" type="file"  accept="application/pdf" onChange={handleFileChange}/> 
             {/* import file */}
             
            
              
             
            </div>
          </div>
        </div>
        <div className="botton">
          <div className="group-8">
            <img
            type="button"
              src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/2pekb39nnrn-241%3A541?alt=media&token=d096e127-516e-46f3-94ed-22e03bb31dce"
              alt="Not Found"
              className="group-7"
              data-toggle="modal" 
              data-target="#myModal_use"
            />
            <img
            
            src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/2v8n9aglm7c-201%3A3714?alt=media&token=0f349e10-9867-421e-9e72-89d79c32c01f"
            alt="Not Found"
            className="group-use"
            
          />
          </div>

           {/* popup new contract */}
           <div className="modal fade" id="myModal_use" role="dialog">
                  <div className="modal-dialog">
                    <div className="modal-content">
                    <div className="pop-up-share clip-contents">
      <div className="group-964">
        <div className="frame-157">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/8d1jczp3xfn-201%3A3738?alt=media&token=2e0d1dd1-46a2-4af5-b7d1-9d6d00a0bda9"
            alt="Not Found"
            className="group-17"
          />
          <div className="frame-156">
            <div className="frame-155">
              <p className="only-you-can-access">Only you can access</p>
            </div>
          </div>
        </div>
        <div className="frame-162">
          <div className="frame-1561">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/8d1jczp3xfn-201%3A3761?alt=media&token=ece7bd8a-9fea-4a96-ac20-3f6820498359"
              alt="Not Found"
              className="group-18"
            />
            <div className="frame-1551">
              <p className="everyone-who-has-link-ca">
                Everyone who has link can access
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
                    
                    </div>
                  </div>
                </div>


          
                <button onClick={generatePdf} className="frame-57">
            <div className="frame-56">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/2pekb39nnrn-241%3A551?alt=media&token=50eade54-1e95-441c-9982-29db433e3fca"
                alt="Not Found"
                className="save"
              />
               <p className="savebutton"  >Save</p>
            </div>
          </button>
          <div className="frame-49">
            <div className="frame-48">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/2pekb39nnrn-241%3A558?alt=media&token=ed05d2ed-8d88-4a7c-aab9-2b92c743bc83"
                alt="Not Found"
                className="share-2"
              />
              <button type="button" data-toggle="modal" data-target="#myModal" className="sharebutton">.</button>

            </div>
          </div>
          {/**/}
          <div className="modal fade" id="myModal" role="dialog">
                  <div className="modal-dialog">
                    <div className="modal-content">
                    <div className="popup-share clip-contents">
      <div className="group-446">
        <p className="accessible-person">Accessible person</p>

        <div className="email-search-container">
      <input
        type="text"
        placeholder="Search 'example1@example.com'"
        value={searchTerm}
        onChange={handleSearchTermChange}
        className="email-search-input"
      />
      <select
        value={selectedEmail}
        onChange={(e) => handleEmailSelect(e.target.value)}
        className="email-select"
      >
        <option value="">search results</option>
        {filteredEmails.map((email) => (
          <option key={email.id} value={email.email}>
            {email.email}
          </option>
        ))}
      </select>
      <div className="selected-email-container">
        <p >{selectedEmail}</p>
      </div>
    </div>
        <div className="frame-148">
          <div className="frame-147">
            <div className="frame-146">
              <p className="anna-_hr-you">Anna_HR (you)</p>
              <p className="anna-hr-mail-com">anna.hr@mail.com</p>
            </div>
          </div>
          <p className="owner">Owner</p>
        </div>
        <p className="general-access">General access</p>
        <div className="frame-157">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/2v8n9aglm7c-201%3A3714?alt=media&token=0f349e10-9867-421e-9e72-89d79c32c01f"
            alt="Not Found"
            className="group-17"
          />
           <form  action="/action_page.php">
      <select className="select_sharelink" name="sharelink" id="sharelink">
        <option value="limited_rights">limited rights</option>
        <option value="everyone">everyone</option>
      </select>
    </form>
        </div>
        <div className="frame-161">
          <div className="frame-159">
            <div className="frame-158">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/2v8n9aglm7c-201%3A3725?alt=media&token=68564ddc-b99e-4cde-a490-6ca8ec242621"
                alt="Not Found"
                className="link"
              />
              <button type="button" onClick={handleCopyLink} className="copy-link">Copy link</button>
            
            </div>
          </div>
          <div className="frame-160">
            <div className="frame-1581">
              <button className="donebutton" type="button"  data-dismiss="modal">Done</button>
            </div>
          </div>
        </div>

        <div>
      {/* Copy link button */}
    
    </div>

      </div>
    </div>
                    </div>
                  </div>
                </div>
        </div>
      </div>
    </div>
    <div className="tab-barr clip-contents">
      <div >{/* className="group-259" */}
        <div className="boxes">
        <div type="button" data-toggle="modal" data-target="#myModal_new" className="newcontract-botton">
            <div className="frame-65">
              
              <p  className="newcontract_text">new contract</p>
            </div>
          </div>
          {/* popup new contract */}
          <div className="modal fade" id="myModal_new" role="dialog">
                  <div className="modal-dialog">
                    <div className="modal-content">
                    <div className="pop-up-guest-invited clip-contents">
      <div className="group-446">
        <p className="accessible-person">New contract</p>
        
       
     
      
        <div className="frame-161">
         
          <div className="frame-160">
            <div className="frame-1581">
              <button className="donebutton" type="button"  data-dismiss="modal">Done</button>
            </div>
          </div>
          <div type="button" className="frame-159">
            <div className="frame-158">
             
              <p className="copy-link">New</p>
            </div>
          </div>
        </div>
      </div>
    </div>
                    
                    </div>
                  </div>
                </div>

          <form  action="/action_page.php">
      <select className="select_type" name="cars" id="cars">
        <option value="Employee">Employee</option>
        <option value="Client">Client</option>
        <option value="Me">Me</option>
      </select>
    </form>
    <div className="Box_select">

    <Autocomplete
        className="select_name"
        freeSolo
        options={data.map((item) => item.fullNameEng)}
        onInputChange={(event, value) => setSearchTerm(value)}
        onChange={(event, value) => {
          const selectedData = data.find((item) => item.fullNameEng === value);
          handleDataClick(selectedData.intern_ID);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Name"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}
      />
      
    </div>
          {/*  */}
        



        </div>
        <div className="custom-fill">
          <p className="custom-fill-fields">Custom fill fields</p>
          <div className="custom-box">
            <div className="frame-144">
              <p className="personal-details">Personal details</p>
              <div className="personal-details-1">
                <div className="full-name-1">
                  
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/ft4nord2bg7-241%3A739?alt=media&token=059c278f-7072-40b4-8103-c94a63d52ae4"
                    alt="Not Found"
                    className="user"
                  />
                 <button
                  draggable
                  onDragStart={(event) => handleDragStart(event, { name: selectedData.fullNameEng })}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => handleListItemClick(selectedData.fullNameEng)}
                >
                    <strong className="text-custom-fill">FullName</strong>
                  </button>
                </div>
                <div className="address-1">
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/ft4nord2bg7-241%3A744?alt=media&token=ae685754-7107-4a17-968c-0777a815cf56"
                    alt="Not Found"
                    className="map-pin"
                  />
                      <button
                  draggable
                  onDragStart={(event) => handleDragStart(event, { name: selectedData.currentAddress })}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => handleListItemClick(selectedData.currentAddress)}
                >
                  <strong className="text-custom-fill">Address</strong>
                </button>
                </div>
                <div className="frame-85">
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/ft4nord2bg7-241%3A749?alt=media&token=cdc5fa3e-7613-4d4d-9756-614c1168cba2"
                    alt="Not Found"
                    className="credit-card"
                  />
                  <button type="button" className="personal-id" 
                  draggable
                  onDragStart={(event) => handleDragStart(event, { name: 'Personal ID' })}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop} 
                  onClick={() => handleListItemClick('Personal ID')}>Personal ID</button>
                </div>
                <div className="email-1">
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/ft4nord2bg7-241%3A754?alt=media&token=607c7423-d3c4-407f-bd56-e442211ceca0"
                    alt="Not Found"
                    className="mail"
                  />
                        <button
                  draggable
                  onDragStart={(event) => handleDragStart(event, { name: selectedData.email })}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => handleListItemClick(selectedData.email)}
                >
                  <strong className="text-custom-fill">Email</strong> 
                </button>
                </div>
                <div className="phone-number-1">
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/ft4nord2bg7-241%3A759?alt=media&token=c1742e60-0f39-40d2-a3fc-4bc416c509cd"
                    alt="Not Found"
                    className="phone"
                  />
                      <button
                  draggable
                  onDragStart={(event) => handleDragStart(event, { name: selectedData.phoneNumber })}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => handleListItemClick(selectedData.phoneNumber)}
                >
                  <strong className="text-custom-fill">Phone</strong> 
                </button>
                </div>
                <div className="signature-1">
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/ft4nord2bg7-241%3A763?alt=media&token=3077b07b-5bab-40fe-956b-18774aa90027"
                    alt="Not Found"
                    className="edit-3"
                  />
                  <button type="button" className="signature" 
                  draggable
                  onDragStart={(event) => handleDragStart(event, { name: 'Signature' })}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop} 
                  onClick={() => handleListItemClick('Signature')}>Signature</button>
                </div>
              </div>
            </div>
            <div className="frame-143">
              <p className="company-details">Company details</p>
              <div className="company-details-1">
                <div className="company-3">
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/ft4nord2bg7-241%3A771?alt=media&token=4d94ea8a-8f5c-4c4c-a406-48ad1b72f683"
                    alt="Not Found"
                    className="mdi-company"
                  />
                  <button type="button" className="company" 
                  draggable
                  onDragStart={(event) => handleDragStart(event, { name: 'Company' })}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop} 
                  onClick={() => handleListItemClick('Company')}>Company</button>
                </div>
                <div className="department-1">
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/ft4nord2bg7-241%3A775?alt=media&token=48167d33-4567-4aa2-bc86-ee8fe9f951be"
                    alt="Not Found"
                    className="users"
                  />
                  <button type="button" className="department" 
                  draggable
                  onDragStart={(event) => handleDragStart(event, { name: 'Department' })}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop} 
                  onClick={() => handleListItemClick('Department ')}>Department</button>
                </div>
                <div className="position-1">
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/ft4nord2bg7-241%3A782?alt=media&token=a2c6c32c-8883-428f-8e52-b396190b3836"
                    alt="Not Found"
                    className="briefcase"
                  />
                   <button
                  draggable
                  onDragStart={(event) => handleDragStart(event, { name: selectedData.position })}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => handleListItemClick(selectedData.position)}
                >
                  <strong className="text-custom-fill">Position</strong> 
                </button>
                </div>
                <div className="salary-1">
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/ft4nord2bg7-241%3A787?alt=media&token=575ccafa-ea1f-491b-9c7c-3888441cb9bf"
                    alt="Not Found"
                    className="dollar-sign"
                  />
                  <button type="button" className="salary" 
                  draggable
                  onDragStart={(event) => handleDragStart(event, { name: 'Salary' })}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop} 
                  onClick={() => handleListItemClick('Salary ')}>Salary</button>
                </div>
              </div>
            </div>
            <div className="frame-142">
              <p className="date-and-time">Date and time</p>
              <div className="date-time">
                <div className="date-2">
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/ft4nord2bg7-241%3A795?alt=media&token=e8741ab4-19a0-44ee-abb2-dd9cc037c58b"
                    alt="Not Found"
                    className="calendar"
                  />
                  <button type="button" className="date" 
                  draggable
                  onDragStart={(event) => handleDragStart(event, { name: 'Date' })}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop} 
                  onClick={() => handleListItemClick('Date ')}>Date</button>
                </div>
                <div className="time-2">
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/ft4nord2bg7-241%3A802?alt=media&token=28f5f314-12b0-472f-9a2c-9c335b6a0d27"
                    alt="Not Found"
                    className="clock"
                  />
                  <button type="button" className="time" 
                  draggable
                  onDragStart={(event) => handleDragStart(event, { name: 'Time' })}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop} 
                  onClick={() => handleListItemClick('Time')}>Time</button>
                </div>
                <div className="salary-2">
                  <p className="_-123">123</p>
                  <button type="button" className="number" 
                  draggable
                  onDragStart={(event) => handleDragStart(event, { name: 'Number' })}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop} 
                  onClick={() => handleListItemClick('Number ')} > Number
                  </button>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>



{/* main */}

<center>
{/* pdf */}
<div>
<center>

      <div className="text-editor">

         <EditorToolbar className="edit-toolbar"/>
      <br/>
      <br/>
          <ReactQuill
          className="text-data"
          theme="snow"
          value={content}
          onChange={handleContentChange}
          modules={modules}
          formats={formats}
          
      />
        <br />
      
        <br />
      </div>
       {pdfFile && (
        <Document file={pdfFile} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
          <Page pageNumber={currentPage} />
        </Document>
      )}

      {numPages && (
        <div>
          <button disabled={currentPage <= 1} onClick={() => setCurrentPage(currentPage - 1)}>
            Previous Page
          </button>
          <span>
            Page {currentPage} of {numPages}
          </span>
          <button disabled={currentPage >= numPages} onClick={() => setCurrentPage(currentPage + 1)}>
            Next Page
          </button>
        </div>
      )}
    </center>

    </div>

    </center>


<br/><br/><br/><br/><br/><br/><br/><br/><br/>
    <div className="bottom-nav clip-contents">
      <div className="group-447">
        <div className="frame-109">
          <div type="button" className="fav-botton">
            <div className="frame-65">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/awg470pvl9-241%3A575?alt=media&token=8268882a-eb17-4bc6-b28a-b2deecb598d0"
                alt="Not Found"
                className="heart"
              />
              <p className="add-to-favorite">Add to favorite</p>
            </div>
          </div>
          <div className="preview-1" >
            <div className="frame-89">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/awg470pvl9-241%3A580?alt=media&token=9c63d45d-0542-4c3c-8b30-272cbad1e262"
                alt="Not Found"
                className="eye"
                type="button"
              />
              <button
                  onClick={() => setIsPreviewOpen(true)}
                  data-toggle="modal"
                  data-target="#myModal_preview"
                  className="preview"
                >
                  Preview
                </button>
            </div>
          </div>
          {/**/}
           {/* popup new contract */}

           {/* popup new contract */}
           {isPreviewOpen && (
            <PreviewPopup content={previewContent} onClose={closePreview} />
)}
      
          {/*  */}
        </div>
        <div className="frame-108">
          <div className="zoom-in-out-line">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/awg470pvl9-241%3A586?alt=media&token=df058e92-42e3-40e0-bc22-18ab426fde14"
              alt="Not Found"
              className="group-9"
            />
            <p className="_-50">50%</p>
          </div>
          <img
            src="https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/awg470pvl9-241%3A590?alt=media&token=93ac14af-ed9b-4bf3-9ca5-81471dcafe9b"
            alt="Not Found"
            className="frame-107"
          />
        </div>
      </div>
    </div>
          </Typography>
        </Stack>
      </Container>
    </>
  );
}
