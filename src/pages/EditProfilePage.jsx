import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, X, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './EditProfilePage.css';

const GENDERS = ['Man', 'Woman', 'Non-binary'];
const PRONOUNS = ['he/him', 'she/her', 'they/them', 'ask me'];
const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Kannada', 'Malayalam', 'Gujarati', 'Punjabi', 'Urdu', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Mandarin', 'Arabic'];
const INTENTIONS = ['Life partner', 'Long-term', 'Short-term', 'Casual', 'Figuring it out'];
const EXERCISE = ['Never', 'Sometimes', 'Active', 'Daily'];
const DRINKING = ['Never', 'Socially', 'Frequently', 'Sober'];
const SMOKING = ['Never', 'Socially', 'Regularly'];
const CANNABIS = ['Never', 'Socially', 'Regularly'];
const ZODIAC = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const DIETS = ['Omnivore', 'Vegetarian', 'Vegan', 'Pescatarian', 'Kosher', 'Halal'];
const KIDS = ['Want someday', 'Don\'t want', 'Have kids', 'Open to kids', 'Not sure'];
const PETS = ['Dog lover', 'Cat lover', 'Both', 'No pets', 'Allergic'];
const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jewish', 'Spiritual', 'Agnostic', 'Atheist', 'Other'];
const POLITICS = ['Liberal', 'Moderate', 'Conservative', 'Apolitical'];
const ALL_INTERESTS = ['Travel', 'Music', 'Cooking', 'Photography', 'Fitness', 'Reading', 'Movies', 'Art', 'Dancing', 'Yoga', 'Hiking', 'Gaming', 'Coffee', 'Wine', 'Dogs', 'Cats', 'Fashion', 'Technology', 'Startups', 'Writing', 'Meditation', 'Sports', 'Comedy', 'Anime', 'Foodie', 'Volunteering', 'Sustainability'];

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, dispatch } = useAuth();

  const [formData, setFormData] = useState({
    photos: [],
    bio: '',
    prompts: [],
    name: '',
    age: '',
    gender: '',
    pronouns: '',
    location: '',
    languages: [],
    intention: '',
    height: '',
    exercise: '',
    drinking: '',
    smoking: '',
    cannabis: '',
    zodiac: '',
    diet: '',
    kids: '',
    pets: '',
    jobTitle: '',
    company: '',
    school: '',
    religion: '',
    politics: '',
    interests: []
  });

  useEffect(() => {
    if (user) {
      setFormData({
        photos: user.photos || [],
        bio: user.bio || '',
        prompts: user.prompts || [],
        name: user.name || '',
        age: user.age || '',
        gender: user.gender || '',
        pronouns: user.pronouns || '',
        location: user.location || '',
        languages: user.languages || [],
        intention: user.intention || '',
        height: user.vitals?.height || '',
        exercise: user.exercise || '',
        drinking: user.vitals?.drinking || '',
        smoking: user.vitals?.smoking || '',
        cannabis: user.cannabis || '',
        zodiac: user.zodiac || '',
        diet: user.diet || '',
        kids: user.kids || '',
        pets: user.pets || '',
        jobTitle: user.jobTitle || user.vitals?.work || '',
        company: user.company || '',
        school: user.school || user.vitals?.education || '',
        religion: user.vitals?.religion || '',
        politics: user.vitals?.politics || '',
        interests: user.interests || []
      });
    }
  }, [user]);

  const handleSave = () => {
    const updatedFields = {
      name: formData.name,
      gender: formData.gender,
      pronouns: formData.pronouns,
      location: formData.location,
      photos: formData.photos,
      bio: formData.bio,
      prompts: formData.prompts,
      intention: formData.intention,
      languages: formData.languages,
      interests: formData.interests,
      zodiac: formData.zodiac,
      exercise: formData.exercise,
      cannabis: formData.cannabis,
      diet: formData.diet,
      kids: formData.kids,
      pets: formData.pets,
      company: formData.company,
      jobTitle: formData.jobTitle,
      school: formData.school,
      vitals: {
        ...(user?.vitals || {}),
        height: formData.height,
        work: formData.jobTitle,
        education: formData.school,
        drinking: formData.drinking,
        smoking: formData.smoking,
        religion: formData.religion,
        politics: formData.politics,
      }
    };

    dispatch({ type: 'UPDATE_PROFILE', payload: updatedFields });
    navigate(-1);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field, value, max = null) => {
    setFormData(prev => {
      const current = prev[field] || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        if (max && current.length >= max) return prev;
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const removePhoto = (index) => {
    setFormData(prev => {
      const newPhotos = [...prev.photos];
      newPhotos.splice(index, 1);
      return { ...prev, photos: newPhotos };
    });
  };

  const updatePrompt = (index, answer) => {
    setFormData(prev => {
      const newPrompts = [...prev.prompts];
      if (newPrompts[index]) {
        newPrompts[index] = { ...newPrompts[index], answer };
      }
      return { ...prev, prompts: newPrompts };
    });
  };

  const renderPills = (field, options, allowMultiple = false) => {
    return (
      <div className="pill-selector">
        {options.map(option => {
          const isSelected = allowMultiple 
            ? formData[field].includes(option)
            : formData[field] === option;
            
          return (
            <button
              key={option}
              type="button"
              className={`pill-option ${isSelected ? 'selected' : ''}`}
              onClick={() => allowMultiple ? toggleArrayItem(field, option) : updateField(field, option)}
            >
              {option}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-topbar">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} color="var(--text-primary)" />
        </button>
        <h2>Edit Profile</h2>
        <button className="save-btn" onClick={handleSave}>Save</button>
      </div>

      <div className="edit-content">
        {/* SECTION 1: PHOTOS */}
        <section className="edit-section">
          <h3 className="section-title">Photos</h3>
          <div className="photo-grid">
            {[0, 1, 2, 3, 4, 5].map(index => {
              const photo = formData.photos[index];
              if (photo) {
                return (
                  <div key={`photo-${index}`} className="photo-slot filled">
                    {index === 0 && <span className="primary-label">Primary</span>}
                    <img src={photo} alt={`Profile slot ${index + 1}`} />
                    <button className="photo-remove-btn" onClick={() => removePhoto(index)}>
                      <X size={14} color="#fff" strokeWidth={3} />
                    </button>
                  </div>
                );
              }
              return (
                <div key={`photo-${index}`} className="photo-slot empty">
                  <div className="empty-indicator">
                    <Plus size={28} color="var(--text-secondary)" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: ABOUT ME */}
        <section className="edit-section">
          <h3 className="section-title">About Me</h3>
          <div className="textarea-container">
            <textarea
              className="bio-textarea"
              placeholder="A little bit about you..."
              value={formData.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              maxLength={500}
              rows={4}
            />
            <div className="char-count">{formData.bio.length} / 500</div>
          </div>
        </section>

        {/* SECTION 3: PROMPTS */}
        {formData.prompts.length > 0 && (
          <section className="edit-section">
            <h3 className="section-title">Profile Prompts</h3>
            <div className="prompts-list">
              {formData.prompts.map((prompt, index) => (
                <div key={index} className="prompt-edit-card">
                  <label className="prompt-label">{prompt.question}</label>
                  <textarea
                    className="prompt-textarea"
                    value={prompt.answer}
                    onChange={(e) => updatePrompt(index, e.target.value)}
                    placeholder="Enter your answer..."
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 4: BASICS */}
        <section className="edit-section">
          <h3 className="section-title">Basics</h3>
          <div className="fields-group">
            <div className="field-row">
              <label className="field-label">Name</label>
              <input type="text" className="field-input" value={formData.name} onChange={e => updateField('name', e.target.value)} />
            </div>
            <div className="field-row">
              <label className="field-label">Age</label>
              <input type="text" className="field-input read-only" value={formData.age} readOnly />
            </div>
            <div className="field-col">
              <label className="field-label-col">Gender</label>
              {renderPills('gender', GENDERS)}
            </div>
            <div className="field-col">
              <label className="field-label-col">Pronouns</label>
              {renderPills('pronouns', PRONOUNS)}
            </div>
            <div className="field-row">
              <label className="field-label">Location</label>
              <input type="text" className="field-input" value={formData.location} onChange={e => updateField('location', e.target.value)} />
            </div>
            <div className="field-col">
              <label className="field-label-col">Languages</label>
              <div className="chip-grid">
                {LANGUAGES.map(lang => {
                  const isSelected = formData.languages.includes(lang);
                  return (
                    <button
                      key={lang}
                      className={`chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleArrayItem('languages', lang)}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: RELATIONSHIP GOALS */}
        <section className="edit-section">
          <h3 className="section-title">Relationship Goals</h3>
          <div className="fields-group">
            <div className="field-col">
              <label className="field-label-col">Looking For</label>
              {renderPills('intention', INTENTIONS)}
            </div>
          </div>
        </section>

        {/* SECTION 6: LIFESTYLE */}
        <section className="edit-section">
          <h3 className="section-title">Lifestyle</h3>
          <div className="fields-group">
            <div className="field-row">
              <label className="field-label">Height</label>
              <input type="text" className="field-input" value={formData.height} onChange={e => updateField('height', e.target.value)} placeholder="e.g. 5'11&quot;" />
            </div>
            <div className="field-col">
              <label className="field-label-col">Exercise</label>
              {renderPills('exercise', EXERCISE)}
            </div>
            <div className="field-col">
              <label className="field-label-col">Drinking</label>
              {renderPills('drinking', DRINKING)}
            </div>
            <div className="field-col">
              <label className="field-label-col">Smoking</label>
              {renderPills('smoking', SMOKING)}
            </div>
            <div className="field-col">
              <label className="field-label-col">Cannabis</label>
              {renderPills('cannabis', CANNABIS)}
            </div>
            <div className="field-col">
              <label className="field-label-col">Zodiac</label>
              {renderPills('zodiac', ZODIAC)}
            </div>
            <div className="field-col">
              <label className="field-label-col">Diet</label>
              {renderPills('diet', DIETS)}
            </div>
          </div>
        </section>

        {/* SECTION 7: FAMILY PLANS */}
        <section className="edit-section">
          <h3 className="section-title">Family Plans</h3>
          <div className="fields-group">
            <div className="field-col">
              <label className="field-label-col">Kids</label>
              {renderPills('kids', KIDS)}
            </div>
            <div className="field-col">
              <label className="field-label-col">Pets</label>
              {renderPills('pets', PETS)}
            </div>
          </div>
        </section>

        {/* SECTION 8: WORK & EDUCATION */}
        <section className="edit-section">
          <h3 className="section-title">Work & Education</h3>
          <div className="fields-group">
            <div className="field-row">
              <label className="field-label">Job Title</label>
              <input type="text" className="field-input" value={formData.jobTitle} onChange={e => updateField('jobTitle', e.target.value)} />
            </div>
            <div className="field-row">
              <label className="field-label">Company</label>
              <input type="text" className="field-input" value={formData.company} onChange={e => updateField('company', e.target.value)} />
            </div>
            <div className="field-row">
              <label className="field-label">School</label>
              <input type="text" className="field-input" value={formData.school} onChange={e => updateField('school', e.target.value)} />
            </div>
          </div>
        </section>

        {/* SECTION 9: BELIEFS */}
        <section className="edit-section">
          <h3 className="section-title">Beliefs</h3>
          <div className="fields-group">
            <div className="field-col">
              <label className="field-label-col">Religion</label>
              {renderPills('religion', RELIGIONS)}
            </div>
            <div className="field-col">
              <label className="field-label-col">Politics</label>
              {renderPills('politics', POLITICS)}
            </div>
          </div>
        </section>

        {/* SECTION 10: INTERESTS */}
        <section className="edit-section" style={{ paddingBottom: '100px' }}>
          <div className="section-title-wrap">
            <h3 className="section-title">Interests</h3>
            <span className="count-label">{formData.interests.length}/8</span>
          </div>
          <div className="chip-grid">
            {ALL_INTERESTS.map(interest => {
              const isSelected = formData.interests.includes(interest);
              return (
                <button
                  key={interest}
                  className={`chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleArrayItem('interests', interest, 8)}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
};

export default EditProfilePage;
