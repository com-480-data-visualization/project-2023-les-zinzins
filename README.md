# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Kelyan Hangard | 312936 |
| Pierre Hellich | 316491 |
| Gaston Wolfart | 311916 |

## Visualization Website: [Click here to visit the website](https://com-480-data-visualization.github.io/project-2023-les-zinzins/website/)

[Milestone 1](#milestone-1-friday-7th-april-5pm) • [Milestone 2](#milestone-2-5th-may-5pm) • [Milestone 3](#milestone-3-2nd-june-5pm)

## Milestone 1 (Friday 7th April, 5pm)

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

### Dataset

We found the dataset on [Kaggle](https://www.kaggle.com/datasets/thedevastator/airbnb-prices-in-european-cities) (posted Ferbruary 2023). The data was already pre-processed as it comes from the study ["Determinants of Airbnb prices in European cities: A spatial econometrics approach (Supplementary Material)"](https://zenodo.org/record/4446043#.ZC7bqnZBzEZ) released in January 13, 2021. So there was no duplicates nor missing values. One noticable point was that a very small fraction of the housings were very expensive, so we considered them as outliers and removed the 1% most costly ones in order not to crush our graphs.

There were two files by city : one for weekend and the other for weekdays. We created a bigger dataframe by concatenating all files and adding two columns *CITY* and *TIME*.

### Problematic

Airbnb is a service that permits individuals to rent their appartement to others for a short duration, usually for vacation.

Our goal is to have a visualization that will help the user and guide him to find the perfect vacation spot. The visualization will focus on getting an overview of all the housing options and what they offer in terms of price, cleanliness, location and so on.

However, Airbnb is not only for people seeking to rent a place for the holidays but also for people wanting to make money by leasing their home while they're away. With this in mind, our visualization will include a way to get lessors to choose the right price range for their location and get an overview of what other people offer to compare.

### Exploratory Data Analysis

As you can see in this first graphic, the distribution of total prices in our dataset is heavy-tailed. This indicates that, while the majority of Airbnb listings are priced between 100 and 300 €, there are still a significant number of listings with higher prices. It is important to consider these higher-priced listings when analyzing the data, as they may provide valuable insights into luxury accommodations or unique property types that are available for rent.

![Distribution prices](images/histogram_distribution_prices.png)

The distribution of distances from the city center is also heavy-tailed, with most housings located within 5 km of the city center. This implies that a majority of listings offer convenient access to popular attractions, restaurants, and cultural sites, which is what travelers look for. 

![Distribution distance](images/histogram_distribution_distance.png)

From the box plot, we can observe significant gaps in prices across cities. For instance, the median price of an Airbnb in Amsterdam is around three times higher than in Athens. This shows the price variations between different destinations and can influence the travelers’ choice of city based on their budget. In addition, we can see that most cities have higher prices during weekends. There are however, some notable exceptions to this trend, such as Paris and Athens, where prices remain close regardless of whether it's a weekend or a weekday. Barcelona presents a interesting case, as it has higher prices during weekdays compared to weekends.

![Prices per city](images/boxplot_prices_per_city.png)

From the correlation matrix, it is interesting to observe a strong correlation between guest satisfaction and cleanliness rating. This finding suggests that guests value cleanliness as an essential factor contributing to their overall satisfaction. This is an expected result but the correlation matrix also highlights that the most significant influence on price is the person capacity. Interestingly, the price is negatively correlated with guest satisfaction. This observation indicates that higher-priced accommodations do not necessarily guarantee a better guest experience. 

![Correlation matrix](images/correlation_matrix.png)


### Related work

As this dataset was released publicly two months ago, there is only a few data analysis and visualization done. The work mostly consists of : 

- Box plots and histogram of price density for each city 
- Hexbin plot with distributions of Price vs Distance to center
- Box plot and histogram of nb related person capacity, cleanliness rating, bedrooms, overall rating, distance to the center, and distance to the metro (all destinations included)
- Regression on the same features as a function of the price (all destinations included)
- Correlation matrix between all these features to determine the redundant one

Our original approach is to design a website to visualize these data in a ludic and interactive way. We could reshape our graph in a more expressive way to understand the order of magnitude at a first glance. Some of our ideas are : 

- Parallel coordinates for all our features (one line for each city)
- Recursive subdivision for nb of Airbnb by city
- Geometry distortion (or the same graph as in Every noise at once) across European cities regarding prices or another feature

We don’t have a lot of sources of inspiration. However we could cite the examples shown during the class, and some of the notebooks already released concerning this dataset gave us the first keys to understanding which insights in data could be relevant to explore and then show. 

## Milestone 2 (5th May, 5pm)

**10% of the final grade**


## Milestone 3 (2nd June, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

