const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
    const info = await transporter.sendMail({
      from: '"NextGen Hiring" <' + process.env.EMAIL_USER + '>',
      to, subject,
      text: text || '',
      html: html || '<pre>' + (text||'') + '</pre>'
    });
    console.log('Email sent to:', to);
    return info;
  } catch(err) {
    console.error('Email failed:', err.message);
    return null;
  }
};

const sendApplicationEmails = async (applicantId, jobId, coverLetter, pool) => {
  try {
    const applicant = await pool.query(
      'SELECT username,email FROM users WHERE id=$1', [applicantId]);
    const job = await pool.query(
      `SELECT j.*,u.username as poster_name,u.email as poster_email
       FROM jobs j LEFT JOIN users u ON j.posted_by=u.id WHERE j.id=$1`,
      [jobId]);
    if (!applicant.rows.length || !job.rows.length) return;
    const a = applicant.rows[0];
    const j = job.rows[0];
    if (j.poster_email) {
      await sendEmail({
        to: j.poster_email,
        subject: 'New Application: '+j.title+' from '+a.username,
        text: 'Hello '+j.poster_name+',\n\n'+a.username+' applied for '+
          j.title+' at '+j.company+'.\n\nCover Letter: '+(coverLetter||'None')+
          '\n\nReview in your NextGen Hiring dashboard.\n— NextGen Hiring'
      });
    }
    await sendEmail({
      to: a.email,
      subject: 'Application Submitted: '+j.title+' at '+j.company,
      text: 'Hi '+a.username+',\n\nYour application for '+j.title+' at '+
        j.company+' was submitted successfully!\n\n'+
        'We will notify you when the employer responds.\n— NextGen Hiring'
    });
  } catch(err) {
    console.error('sendApplicationEmails:', err.message);
  }
};

const sendStatusUpdateEmail = async (applicationId, newStatus, pool) => {
  try {
    const r = await pool.query(
      `SELECT ja.*,j.title,j.company,u.username,u.email
       FROM job_applications ja
       JOIN jobs j ON ja.job_id=j.id
       JOIN users u ON ja.user_id=u.id
       WHERE ja.id=$1`, [applicationId]);
    if (!r.rows.length) return;
    const app = r.rows[0];
    const msgs = {
      shortlisted: 'Congratulations! You have been SHORTLISTED for '+app.title+' at '+app.company+'!',
      rejected: 'Thank you for applying to '+app.title+'. The employer has moved forward with other candidates.',
      hired: 'AMAZING NEWS! You have been HIRED for '+app.title+' at '+app.company+'! Congratulations!'
    };
    if (msgs[newStatus]) {
      await sendEmail({
        to: app.email,
        subject: 'Application Update: '+app.title+' — '+newStatus.toUpperCase(),
        text: 'Hi '+app.username+',\n\n'+msgs[newStatus]+'\n\n— NextGen Hiring'
      });
    }
  } catch(err) {
    console.error('sendStatusUpdateEmail:', err.message);
  }
};

const sendJobApprovalEmail = async (jobId, pool) => {
  try {
    const r = await pool.query(
      `SELECT j.*,u.username,u.email FROM jobs j
       JOIN users u ON j.posted_by=u.id WHERE j.id=$1`, [jobId]);
    if (!r.rows.length) return;
    const job = r.rows[0];
    await sendEmail({
      to: job.email,
      subject: 'Job Approved: '+job.title+' is now live!',
      text: 'Hi '+job.username+',\n\nYour job "'+job.title+'" has been approved '+
        'and is now visible to all students on NextGen Hiring!\n— NextGen Hiring'
    });
  } catch(err) {
    console.error('sendJobApprovalEmail:', err.message);
  }
};

module.exports = {
  sendEmail,
  sendApplicationEmails,
  sendStatusUpdateEmail,
  sendJobApprovalEmail
};
