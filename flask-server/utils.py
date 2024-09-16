import os
import cv2
import torch
import numpy as np
from cnnmodel import CNNModel
import torch.nn.functional as F
from torchvision import transforms

transform = transforms.Compose(
    [
        transforms.ToPILImage(),
        transforms.Grayscale(num_output_channels=1),
        transforms.Resize((28, 28)),
        transforms.ToTensor(),
        transforms.Normalize(mean=0.485, std=0.229),
    ]
)


def prediction_model():
    """load the trained model"""
    return torch.load("./model.pth", weights_only=False)


def showimage(title: str, img):
    """helper function to show image"""
    cv2.imshow(title, img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


def preprocess(img):
    # convert image to grayscale
    imgGray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # apply gaussian blur
    imgBlur = cv2.GaussianBlur(imgGray, (5, 5), 1)
    # apply adaptive threshold
    imgThreshold = cv2.adaptiveThreshold(imgBlur, 255, 1, 1, 11, 2)
    return imgThreshold


def biggest_contour(contours):
    """find biggest contour with 4 vertices from list of contours"""
    biggest = np.array([])
    max_area = 0
    for contour in contours:
        # find contour area
        area = cv2.contourArea(contour)
        if area > 50:
            # find perimeter
            peri = cv2.arcLength(contour, closed=True)
            # find number of vertices
            approx = cv2.approxPolyDP(contour, 0.02 * peri, closed=True)
            # number of vertices is 4
            if area > max_area and len(approx) == 4:
                biggest = approx
                max_area = area

    return biggest, max_area


def reorder(points):
    """reorder points array as upper left, lower left, lower right, upper right"""
    # create a copy with zeros
    newpoints = np.zeros(points.shape, dtype=np.int32)
    # change shape (4,1,2) -> (4,2)
    points = points.reshape((4, 2))

    # sum along the rows
    add = points.sum(1)
    # min sum -> upper left corner
    newpoints[0] = points[np.argmin(add)]
    # max sum -> lower right corner
    newpoints[3] = points[np.argmax(add)]

    # difference along the rows (y-x)
    diff = np.diff(points, axis=1)
    # min diff -> lower left
    newpoints[1] = points[np.argmin(diff)]
    # max diff -> upper right
    newpoints[2] = points[np.argmax(diff)]

    # return ordered points
    return newpoints


def splitBoxes(img):
    """
    function to split the image into 81 boxes each having 1 digit
    """
    rows = np.vsplit(img, 9)
    boxes = [box for r in rows for box in np.hsplit(r, 9)]
    return boxes


def get_prediction(boxes, model):
    """
    function to get numbers array from the sudoku photo
    """
    numbers = []
    # loop over digit images (sudoku box)
    for image in boxes:
        image = transform(image)
        _, thresholded_image = cv2.threshold(image.numpy(), -0.4, 1, cv2.THRESH_BINARY)
        image = 1 - thresholded_image
        image = torch.Tensor(image)
        image = image.unsqueeze(0)
        predictions = model(image)
        predictions = F.softmax(predictions, dim=-1)
        val, idx = torch.max(predictions.data, 1)
        print(f"{idx} {val}")
        numbers.append(idx)

    return numbers


def save(filename, idx, file):
    if torch.is_tensor(file):
        file = file.permute(1, 2, 0).numpy()
    else:
        file = np.transpose(file, (1, 2, 0))
    img_np = ((file * 0.229 + 0.485) * 255).astype(np.uint8)
    cv2.imwrite(os.path.join("results", f"{filename[:-4]}-{idx:02}.png"), img_np)


def displaynums(img, numbers, color):
    """
    function to display the numbers list in 9x9 grid image
    """

    # section width and height
    secW = int(img.shape[0] / 9)
    secH = int(img.shape[1] / 9)

    for x in range(9):
        for y in range(9):
            if numbers[(y * 9) + x] != 0:
                cv2.putText(
                    img,
                    str(numbers[(y * 9) + x]),
                    ((x * secW + int(secW / 2) - 10), int(((y + 0.8) * secH))),
                    cv2.FONT_HERSHEY_COMPLEX_SMALL,
                    2,
                    color,
                    2,
                    cv2.LINE_AA,
                )
            else:
                cv2.putText(
                    img,
                    "_",
                    ((x * secW + int(secW / 2) - 10), int(((y + 0.8) * secH))),
                    cv2.FONT_HERSHEY_COMPLEX_SMALL,
                    2,
                    color,
                    2,
                    cv2.LINE_AA,
                )

    return img


if __name__ == "__main__":
    filename = "sudoku-test.jpg"
