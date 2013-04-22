require 'spec_helper'

feature 'finding a guide', :js => true do
  scenario 'viewing the homepage' do
    visit '/'
    page.should have_content 'Find a guide'
  end

  scenario 'finding a guide', :js => true do
    visit '/'
    find_guide('0bed6fee853b4f4e966cec0f1210079d')

    page.should have_content 'How to make sous vide chicken'
    page.should have_content 'This is how you do sous vide chicken at hom'
    page.should have_content 'by Rory Herrmann'
  end

  scenario 'finding multiple guides', :js => true do
    visit '/'
    find_guide('0bed6fee853b4f4e966cec0f1210079d')
    page.should have_content 'How to make sous vide chicken'

    find_guide('b995492d5e7943e3b2757a88fe3ef7c6')
    page.should have_content 'How to make Confit Byaldi'
    page.should have_content 'How to make sous vide chicken'
  end

  def find_guide(uuid)
    fill_in 'guide-uuid', with: uuid
    click_on 'Find Guide'
  end
end
