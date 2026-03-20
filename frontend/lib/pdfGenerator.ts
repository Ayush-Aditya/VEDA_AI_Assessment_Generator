import { QuestionPaper } from '@/types';

interface StudentInfo {
  studentName: string;
  studentRoll: string;
  studentSection: string;
}

type DownloadMode = 'question-paper' | 'answer-key';

export async function generatePDF(
  paper: QuestionPaper,
  studentInfo: StudentInfo,
  mode: DownloadMode = 'question-paper'
) {
  const htmlContent = generateHTMLContent(paper, studentInfo, mode);
  
  // Create a new window for printing
  const printWindow = window.open('', '', 'width=800,height=600');
  if (!printWindow) {
    alert('Please allow pop-ups to generate PDF');
    return;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load before printing
  printWindow.onload = () => {
    printWindow.print();
  };
}

export function generateHTMLContent(
  paper: QuestionPaper,
  studentInfo: StudentInfo,
  mode: DownloadMode = 'question-paper'
): string {
  const allQuestions = paper.sections.flatMap((s) => s.questions);
  const hasAnswerKey = allQuestions.some((q) => q.correctAnswer);

  if (mode === 'answer-key') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; padding: 16px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 16px; margin-bottom: 16px; }
          .school-name { font-size: 18px; font-weight: bold; }
          .title { font-size: 16px; font-weight: bold; margin-top: 8px; }
          .details { font-size: 12px; margin-top: 8px; }
          .answer-item { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid #e5e7eb; padding: 8px 0; }
          .empty { color: #6b7280; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="school-name">${paper.schoolName || 'School Name'}</div>
          <div class="title">${paper.title} - Answer Key</div>
          <div class="details">
            Subject: ${paper.subject} ${paper.standard ? `| Class: ${paper.standard}` : ''} ${paper.date ? `| Date: ${paper.date}` : ''}
          </div>
        </div>

        ${
          hasAnswerKey
            ? allQuestions
                .map((q, idx) =>
                  q.correctAnswer
                    ? `<div class="answer-item"><strong>Question ${idx + 1}</strong><span>${q.correctAnswer}</span></div>`
                    : ''
                )
                .join('')
            : '<p class="empty">No answer key available for this paper.</p>'
        }
      </body>
      </html>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .school-name { font-size: 18px; font-weight: bold; }
        .title { font-size: 16px; font-weight: bold; margin-top: 10px; }
        .details { font-size: 12px; margin-top: 10px; }
        .student-info { margin-bottom: 20px; }
        .student-info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 14px; font-weight: bold; margin-bottom: 10px; }
        .section-marks { text-align: right; font-size: 12px; font-weight: bold; margin-top: 10px; }
        .question { margin-bottom: 15px; }
        .question-text { margin-bottom: 5px; }
        .options { margin-left: 20px; }
        .option { margin-bottom: 3px; }
        .marks { float: right; background: #fff3cd; padding: 2px 6px; border-radius: 3px; }
        .footer { text-align: center; margin-top: 30px; border-top: 2px solid #333; padding-top: 20px; font-size: 12px; }
        .answer-key { margin-top: 30px; page-break-before: always; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="school-name">${paper.schoolName || 'School Name'}</div>
        <div class="title">${paper.title}</div>
        <div class="details">
          Subject: ${paper.subject} ${paper.standard ? `| Class: ${paper.standard}` : ''} ${paper.date ? `| Date: ${paper.date}` : ''}
          <br/>
          Total Marks: ${paper.totalMarks} ${paper.duration ? `| Duration: ${paper.duration}` : ''}
        </div>
      </div>

      <div class="student-info">
        <h3>Student Information:</h3>
        ${studentInfo.studentName ? `<div class="student-info-row"><span>Name:</span><span>__________________</span></div>` : ''}
        ${studentInfo.studentRoll ? `<div class="student-info-row"><span>Roll No:</span><span>__________________</span></div>` : ''}
        ${studentInfo.studentSection ? `<div class="student-info-row"><span>Section:</span><span>__________________</span></div>` : ''}
      </div>

      ${paper.sections.map((section, sIdx) => `
        <div class="section">
          <div class="section-title">
            Section ${String.fromCharCode(65 + sIdx)}: ${section.title}
          </div>
          ${section.instructions ? `<p style="font-size: 12px; font-style: italic;">Instructions: ${section.instructions}</p>` : ''}
          ${section.questions.map((q, qIdx) => `
            <div class="question">
              <div class="question-text">
                <span>${qIdx + 1}. ${q.text}</span>
                <span class="marks">[${q.marks}]</span>
              </div>
              ${
                q.options && q.options.length > 0
                  ? `<div class="options">
                    ${q.options.map((opt, oIdx) => `<div class="option">(${String.fromCharCode(97 + oIdx)}) ${opt}</div>`).join('')}
                  </div>`
                  : ''
              }
              ${q.type === 'short-answer' ? '<div style="margin-top: 10px; height: 30px; border-bottom: 1px solid #999;"></div>' : ''}
              ${q.type === 'long-answer' ? '<div style="margin-top: 10px;"><div style="height: 20px; border-bottom: 1px solid #999;"></div><div style="height: 20px; border-bottom: 1px solid #999;"></div></div>' : ''}
            </div>
          `).join('')}
          <div class="section-marks">Total Marks (Section ${String.fromCharCode(65 + sIdx)}): ${section.marks}</div>
        </div>
      `).join('')}

      <div class="footer">
        --- End of Question Paper ---
      </div>

    </body>
    </html>
  `;
}
