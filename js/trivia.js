/**
 * Deepavali Trivia & Gyan Sagar Quiz Engine
 * Interactive cultural quiz testing Ramayan, Puranas, and festive traditions
 */

class DiwaliQuiz {
  constructor() {
    this.currentIdx = 0;
    this.score = 0;
    this.questions = [
      {
        q: 'दीपावली पर लंका विजय के पश्चात अयोध्या लौटने पर प्रभु श्री राम का कितने वर्षों का वनवास समाप्त हुआ था?',
        options: ['१० वर्ष', '१२ वर्ष', '१४ वर्ष', '१६ वर्ष'],
        correct: 2,
        fact: 'प्रभु श्री राम, माता सीता और लक्ष्मण जी १४ वर्ष के वनवास के पश्चात कार्तिक अमावस्या को अयोध्या पधारे थे।'
      },
      {
        q: 'समुद्र मंथन के दौरान कार्तिक मास की पावन अमावस्या को किस देवी का प्राकट्य हुआ था?',
        options: ['माता सरस्वती', 'माता महालक्ष्मी', 'माता पार्वती', 'माता गंगा'],
        correct: 1,
        fact: 'कार्तिक अमावस्या को क्षीरसागर से धन व ऐश्वर्य की देवी मां महालक्ष्मी प्रकट हुई थीं।'
      },
      {
        q: 'धनतेरस के दिन आयुर्वेद एवं आरोग्य के किस दिव्य देव का प्राकट्य दिवस मनाया जाता है?',
        options: ['भगवान धनवंतरि', 'देवर्षि नारद', 'महर्षि चरक', 'अश्विनी कुमार'],
        correct: 0,
        fact: 'भगवान धनवंतरि अमृत कलश लेकर प्रकट हुए थे, इसीलिए धनतेरस पर स्वास्थ्य एवं आरोग्य की आराधना होती है।'
      },
      {
        q: 'गोवर्धन पूजा (अन्नकूट) के दिन भगवान श्री कृष्ण को कितने प्रकार के दिव्य व्यंजनों का महाभोग लगाया जाता है?',
        options: ['२१ भोग', '५६ भोग', '१०८ भोग', '२५१ भोग'],
        correct: 1,
        fact: 'ब्रजवासियों ने भगवान कृष्ण के प्रति कृतज्ञता में ५६ प्रकार के सात्विक व्यंजनों का महाभोग (अन्नकूट) तैयार किया था।'
      },
      {
        q: 'यम द्वितीया के पावन पर्व को जनमानस में किस लोकप्रिय नाम से जाना जाता है?',
        options: ['रक्षाबंधन', 'करवा चौथ', 'भाई दूज', 'हरितालिका तीज'],
        correct: 2,
        fact: 'यम द्वितीया के दिन यमराज अपनी बहन यमुना के घर पधारे थे, जिसे भाई दूज के रूप में मनाया जाता है।'
      }
    ];

    this.init();
  }

  init() {
    this.renderQuestion();
  }

  renderQuestion() {
    const card = document.getElementById('quizCard');
    if (!card) return;

    if (this.currentIdx >= this.questions.length) {
      this.renderResults();
      return;
    }

    const item = this.questions[this.currentIdx];
    card.innerHTML = `
      <div class="quiz-progress-text">प्रश्न ${this.currentIdx + 1} / ${this.questions.length}</div>
      <h3 class="quiz-question-title">${item.q}</h3>
      <div class="quiz-options-list">
        ${item.options.map((opt, idx) => `
          <button class="quiz-option-btn" data-idx="${idx}">
            <span class="option-bullet">${String.fromCharCode(65 + idx)}</span>
            <span class="option-text">${opt}</span>
          </button>
        `).join('')}
      </div>
      <div class="quiz-feedback-box" id="quizFeedback" style="display:none;"></div>
    `;

    const btns = card.querySelectorAll('.quiz-option-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const chosen = parseInt(btn.dataset.idx, 10);
        this.checkAnswer(chosen, item, btns);
      });
    });
  }

  checkAnswer(chosen, item, btns) {
    // Disable all options
    btns.forEach(b => b.disabled = true);
    const feedbackBox = document.getElementById('quizFeedback');

    if (chosen === item.correct) {
      this.score++;
      btns[chosen].classList.add('correct');
      if (feedbackBox) {
        feedbackBox.style.display = 'block';
        feedbackBox.className = 'quiz-feedback-box success';
        feedbackBox.innerHTML = `✨ <strong>बिल्कुल सही उत्तर!</strong> ${item.fact}`;
      }
      if (window.diwaliAudio) window.diwaliAudio.playTempleBell();
    } else {
      btns[chosen].classList.add('wrong');
      btns[item.correct].classList.add('correct');
      if (feedbackBox) {
        feedbackBox.style.display = 'block';
        feedbackBox.className = 'quiz-feedback-box error';
        feedbackBox.innerHTML = `❌ <strong>उचित उत्तर:</strong> ${item.options[item.correct]}। ${item.fact}`;
      }
    }

    // Auto next after 2.4s
    setTimeout(() => {
      this.currentIdx++;
      this.renderQuestion();
    }, 2400);
  }

  renderResults() {
    const card = document.getElementById('quizCard');
    if (!card) return;

    const pct = Math.round((this.score / this.questions.length) * 100);
    let title = '';
    let badge = '';

    if (this.score === 5) {
      title = 'अद्भुत! आप परम दीपावली ज्ञानी हैं!';
      badge = '🏆 स्वर्ण पदक (100% Perfect Score)';
      if (window.fireworks) window.fireworks.burst(window.innerWidth * 0.5, window.innerHeight * 0.3, '#FFD700', 90, true);
    } else if (this.score >= 3) {
      title = 'बहुत सुंदर! आपकी सांस्कृतिक समझ प्रशंसनीय है!';
      badge = '🥈 रजत पदक (Diwali Scholar)';
    } else {
      title = 'अच्छा प्रयास! दीपावली की कथाओं को और गहराई से जानें!';
      badge = '🥉 ज्ञानार्थी पदक (Enthusiastic Learner)';
    }

    card.innerHTML = `
      <div class="quiz-result-view">
        <div class="result-badge-icon">🪔</div>
        <h3 class="result-title">${title}</h3>
        <div class="result-score">प्राप्तांक: ${this.score} / ${this.questions.length} (${pct}%)</div>
        <div class="result-honor-badge">${badge}</div>
        <p class="result-msg">
          दीपावली केवल उत्सव नहीं, बल्कि मर्यादा, त्याग और विजय की अमर सीख है। अपने परिवार और बच्चों के साथ भी यह ज्ञान साझा करें!
        </p>
        <button class="btn-primary" id="restartQuizBtn" style="margin: 1.5rem auto 0;">
          <span>🔄</span> पुनः क्विज़ खेलें (Play Again)
        </button>
      </div>
    `;

    document.getElementById('restartQuizBtn')?.addEventListener('click', () => this.restart());
  }

  restart() {
    this.currentIdx = 0;
    this.score = 0;
    this.renderQuestion();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.diwaliQuiz = new DiwaliQuiz();
});
